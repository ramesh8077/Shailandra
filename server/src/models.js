import { pool, newId } from './mysqlStore.js';

function getPath(object, path) {
  return path.split('.').reduce((value, key) => value == null ? undefined : value[key], object);
}

function setPath(object, path, value) {
  const parts = path.split('.');
  let target = object;
  for (const key of parts.slice(0, -1)) target = target[key] ||= {};
  target[parts.at(-1)] = value;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function valuesMatch(actual, expected) {
  if (expected && typeof expected === 'object' && !Array.isArray(expected) && !(expected instanceof Date)) {
    if ('$in' in expected) return expected.$in.some(value => Array.isArray(actual) ? actual.includes(value) : actual === value);
    if ('$ne' in expected) return expected.$ne === null ? actual !== null && actual !== undefined : actual !== expected.$ne;
    if ('$regex' in expected) return actual != null && new RegExp(expected.$regex, expected.$options || '').test(String(actual));
  }
  if (Array.isArray(actual)) return actual.includes(expected);
  if (expected === null) return actual === null || actual === undefined;
  if (actual instanceof Date) actual = actual.toISOString();
  if (expected instanceof Date) expected = expected.toISOString();
  return actual === expected;
}

function matches(document, filter = {}) {
  return Object.entries(filter).every(([key, expected]) => {
    if (key === '$or') return expected.some(item => matches(document, item));
    if (key === '$and') return expected.every(item => matches(document, item));
    return valuesMatch(key === '_id' ? document._id : getPath(document, key), expected);
  });
}

function applyUpdate(document, update, inserting = false) {
  if (Object.keys(update).some(key => key.startsWith('$'))) {
    for (const [path, value] of Object.entries(update.$set || {})) setPath(document, path, value);
    if (inserting) {
      for (const [path, value] of Object.entries(update.$setOnInsert || {})) {
        if (getPath(document, path) === undefined) setPath(document, path, value);
      }
    }
    for (const [path, amount] of Object.entries(update.$inc || {})) {
      setPath(document, path, (Number(getPath(document, path)) || 0) + Number(amount));
    }
    for (const path of Object.keys(update.$unset || {})) {
      const parts = path.split('.');
      const target = parts.slice(0, -1).reduce((value, key) => value?.[key], document);
      if (target) delete target[parts.at(-1)];
    }
  } else {
    for (const [path, value] of Object.entries(update)) setPath(document, path, value);
  }
  return document;
}

function project(document, selection, defaultExcluded) {
  const output = clone(document);
  const selected = typeof selection === 'string' ? selection.split(' ').filter(Boolean) : [];
  const included = typeof selection === 'object' && selection
    ? Object.keys(selection).filter(key => selection[key])
    : selected.filter(key => !key.startsWith('+'));
  if (included.length) {
    const result = { _id: output._id };
    for (const path of included) {
      const value = getPath(output, path);
      if (value !== undefined) setPath(result, path, value);
    }
    return result;
  }
  for (const field of defaultExcluded) {
    if (selected.includes('+' + field)) continue;
    delete output[field];
  }
  return output;
}

function decorate(document, model) {
  if (!document) return document;
  Object.defineProperty(document, 'toObject', { enumerable: false, value: () => clone(document) });
  Object.defineProperty(document, 'deleteOne', { enumerable: false, value: () => model.deleteById(document._id) });
  return document;
}

class Query {
  constructor(model, filter = {}, single = false, id = null) {
    this.model = model;
    this.filter = filter;
    this.single = single;
    this.id = id;
    this.selection = null;
    this.sortSpec = null;
    this.offset = 0;
    this.limitValue = null;
  }
  select(selection) { this.selection = selection; return this; }
  sort(spec) { this.sortSpec = spec; return this; }
  skip(value) { this.offset = value; return this; }
  limit(value) { this.limitValue = value; return this; }
  lean() { return this; }
  async execute() {
    let rows = this.id ? [await this.model.getById(this.id)].filter(Boolean) : await this.model.getAll();
    rows = rows.filter(item => matches(item, this.filter));
    if (this.sortSpec) {
      const entries = Object.entries(this.sortSpec);
      rows.sort((left, right) => {
        for (const [field, direction] of entries) {
          const a = getPath(left, field);
          const b = getPath(right, field);
          const av = a instanceof Date ? a.getTime() : a;
          const bv = b instanceof Date ? b.getTime() : b;
          if (av === bv) continue;
          if (av == null) return -1 * direction;
          if (bv == null) return 1 * direction;
          return (av < bv ? -1 : 1) * direction;
        }
        return 0;
      });
    }
    if (this.single) return decorate(rows[0] ? project(rows[0], this.selection, this.model.defaultExcluded) : null, this.model);
    if (this.offset) rows = rows.slice(this.offset);
    if (this.limitValue !== null) rows = rows.slice(0, this.limitValue);
    return rows.map(item => decorate(project(item, this.selection, this.model.defaultExcluded), this.model));
  }
  then(resolve, reject) { return this.execute().then(resolve, reject); }
  catch(reject) { return this.execute().catch(reject); }
}

function defineModel(table, defaultExcluded = []) {
  const model = {
    table,
    defaultExcluded,
    async init() { return undefined; },
    async getAll() {
      const [rows] = await pool.query('SELECT doc FROM ' + table);
      return rows.map(row => typeof row.doc === 'string' ? JSON.parse(row.doc) : row.doc);
    },
    async getById(id) {
      const [rows] = await pool.execute('SELECT doc FROM ' + table + ' WHERE id = ? LIMIT 1', [String(id)]);
      if (!rows.length) return null;
      return typeof rows[0].doc === 'string' ? JSON.parse(rows[0].doc) : rows[0].doc;
    },
    find(filter = {}) { return new Query(model, filter); },
    findOne(filter = {}) { return new Query(model, filter, true); },
    findById(id) { return new Query(model, {}, true, id); },
    async countDocuments(filter = {}) { return (await model.getAll()).filter(item => matches(item, filter)).length; },
    async exists(filter = {}) { return (await model.findOne(filter)) !== null; },
    async insert(document) {
      const now = new Date().toISOString();
      const value = { ...clone(document), _id: document._id || newId(), createdAt: document.createdAt || now, updatedAt: now };
      const date = new Date(now);
      await pool.execute('INSERT INTO ' + table + ' (id, doc, created_at, updated_at) VALUES (?, ?, ?, ?)', [
        value._id, JSON.stringify(value), date, date
      ]);
      return decorate(value, model);
    },
    async create(documents) {
      if (Array.isArray(documents)) return Promise.all(documents.map(document => model.insert(document)));
      return model.insert(documents);
    },
    async save(document) {
      const value = clone(document);
      value.updatedAt = new Date().toISOString();
      const [result] = await pool.execute('UPDATE ' + table + ' SET doc = ?, updated_at = ? WHERE id = ?', [
        JSON.stringify(value), new Date(value.updatedAt), value._id
      ]);
      return result.affectedRows ? decorate(value, model) : null;
    },
    async deleteById(id) {
      await pool.execute('DELETE FROM ' + table + ' WHERE id = ?', [String(id)]);
      return { acknowledged: true };
    },
    async findByIdAndUpdate(id, update, options = {}) {
      return model.findOneAndUpdate({ _id: String(id) }, update, options);
    },
    async findOneAndUpdate(filter, update, options = {}) {
      const existing = (await model.getAll()).find(document => matches(document, filter));
      if (!existing) {
        if (!options.upsert) return null;
        const initial = {};
        for (const [key, value] of Object.entries(filter)) {
          if (!key.startsWith('$') && !(value && typeof value === 'object')) setPath(initial, key, value);
        }
        applyUpdate(initial, update, true);
        return model.insert(initial);
      }
      const previous = clone(existing);
      applyUpdate(existing, update);
      const saved = await model.save(existing);
      return options.new || options.returnDocument === 'after' ? saved : decorate(previous, model);
    },
    async updateOne(filter, update, options = {}) {
      const result = await model.findOneAndUpdate(filter, update, { ...options, new: true });
      return { acknowledged: true, matchedCount: result ? 1 : 0, modifiedCount: result ? 1 : 0, upsertedId: options.upsert && result ? result._id : null };
    }
  };
  return model;
}

export const User = defineModel('cms_users', ['passwordHash']);
export const Content = defineModel('cms_contents');
export const Media = defineModel('cms_media');
export const Activity = defineModel('cms_activities');
