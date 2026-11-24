import { DatabaseSync } from 'node:sqlite';
import session from 'express-session';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultDbPath = path.resolve(fileURLToPath(new URL('../shalinder-cms.db', import.meta.url)));

let db;

export function getDb() {
  if (!db) {
    initializeDatabase();
  }
  return db;
}

export function initializeDatabase(dbPath) {
  if (db) return db;
  const finalPath = dbPath || process.env.SQLITE_DB_PATH || defaultDbPath;
  db = new DatabaseSync(finalPath);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS cms_users (
      id TEXT PRIMARY KEY,
      doc TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cms_contents (
      id TEXT PRIMARY KEY,
      doc TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cms_media (
      id TEXT PRIMARY KEY,
      doc TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cms_activities (
      id TEXT PRIMARY KEY,
      doc TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cms_sessions (
      sid TEXT PRIMARY KEY,
      expires INTEGER NOT NULL,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cms_contacts (
      id TEXT PRIMARY KEY,
      doc TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  return db;
}

export function newId() {
  return randomBytes(12).toString('hex');
}

// ─── Generic document-model layer (replaces MySQL pool-based approach) ────

function getPath(object, pathStr) {
  return pathStr.split('.').reduce((v, k) => v == null ? undefined : v[k], object);
}

function setPath(object, pathStr, value) {
  const parts = pathStr.split('.');
  let target = object;
  for (const key of parts.slice(0, -1)) target = target[key] ||= {};
  target[parts.at(-1)] = value;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function valuesMatch(actual, expected) {
  if (expected && typeof expected === 'object' && !Array.isArray(expected) && !(expected instanceof Date)) {
    if ('$in' in expected) return expected.$in.some(v => Array.isArray(actual) ? actual.includes(v) : actual === v);
    if ('$ne' in expected) return expected.$ne === null ? actual !== null && actual !== undefined : actual !== expected.$ne;
    if ('$regex' in expected) return actual != null && new RegExp(expected.$regex, expected.$options || '').test(String(actual));
  }
  if (Array.isArray(actual)) return actual.includes(expected);
  if (expected === null) return actual === null || actual === undefined;
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
  if (Object.keys(update).some(k => k.startsWith('$'))) {
    for (const [p, v] of Object.entries(update.$set || {})) setPath(document, p, v);
    if (inserting) for (const [p, v] of Object.entries(update.$setOnInsert || {})) {
      if (getPath(document, p) === undefined) setPath(document, p, v);
    }
    for (const [p, amount] of Object.entries(update.$inc || {})) {
      setPath(document, p, (Number(getPath(document, p)) || 0) + Number(amount));
    }
    for (const p of Object.keys(update.$unset || {})) {
      const parts = p.split('.');
      const target = parts.slice(0, -1).reduce((v, k) => v?.[k], document);
      if (target) delete target[parts.at(-1)];
    }
  } else {
    for (const [p, v] of Object.entries(update)) setPath(document, p, v);
  }
  return document;
}

function project(document, selection, defaultExcluded = []) {
  const output = clone(document);
  const selected = typeof selection === 'string' ? selection.split(/\s+/).filter(Boolean) : [];
  const included = typeof selection === 'object' && selection
    ? Object.keys(selection).filter(k => selection[k])
    : selected.filter(k => !k.startsWith('+'));
  const explicitlyIncluded = selected.some(k => k.startsWith('+'));
  if (included.length) {
    const result = { _id: output._id };
    for (const p of included) {
      const v = getPath(output, p);
      if (v !== undefined) setPath(result, p, v);
    }
    return result;
  }
  for (const field of defaultExcluded) {
    if (explicitlyIncluded && selected.includes(`+${field}`)) continue;
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
  constructor(model, filter, single = false, id = null) {
    this.model = model;
    this.filter = filter || {};
    this.single = single;
    this.id = id;
    this.selection = null;
    this.sortSpec = null;
    this.offset = 0;
    this.limitValue = null;
  }
  select(sel) { this.selection = sel; return this; }
  sort(spec) { this.sortSpec = spec; return this; }
  skip(val) { this.offset = val; return this; }
  limit(val) { this.limitValue = val; return this; }
  lean() { return this; }
  async execute() {
    let rows = this.id ? [this.model.getById(this.id)].filter(Boolean) : this.model.getAll();
    rows = rows.filter(item => matches(item, this.filter));
    if (this.sortSpec) {
      const entries = Object.entries(this.sortSpec);
      rows.sort((left, right) => {
        for (const [field, direction] of entries) {
          const a = getPath(left, field);
          const b = getPath(right, field);
          if (a === b) continue;
          if (a == null) return -1 * direction;
          if (b == null) return 1 * direction;
          return (a < b ? -1 : 1) * direction;
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

export function defineModel(table, defaultExcluded = []) {
  const model = {
    table,
    defaultExcluded,
    getAll() {
      const rows = getDb().prepare(`SELECT doc FROM ${table}`).all();
      return rows.map(r => JSON.parse(r.doc));
    },
    getById(id) {
      const row = getDb().prepare(`SELECT doc FROM ${table} WHERE id = ?`).get(String(id));
      return row ? JSON.parse(row.doc) : null;
    },
    find(filter = {}) { return new Query(model, filter); },
    findOne(filter = {}) { return new Query(model, filter, true); },
    findById(id) { return new Query(model, {}, true, id); },
    async countDocuments(filter = {}) { return model.getAll().filter(item => matches(item, filter)).length; },
    async exists(filter = {}) { return (await model.findOne(filter)) !== null; },
    insert(document) {
      const now = new Date().toISOString();
      const value = { ...clone(document), _id: document._id || newId(), createdAt: document.createdAt || now, updatedAt: now };
      getDb().prepare(`INSERT INTO ${table} (id, doc, created_at, updated_at) VALUES (?, ?, ?, ?)`)
        .run(value._id, JSON.stringify(value), now, now);
      return decorate(value, model);
    },
    async create(documents) {
      if (Array.isArray(documents)) return documents.map(d => model.insert(d));
      return model.insert(documents);
    },
    save(document) {
      const value = clone(document);
      value.updatedAt = new Date().toISOString();
      const result = getDb().prepare(`UPDATE ${table} SET doc = ?, updated_at = ? WHERE id = ?`)
        .run(JSON.stringify(value), value.updatedAt, value._id);
      return result.changes ? decorate(value, model) : null;
    },
    async deleteById(id) {
      getDb().prepare(`DELETE FROM ${table} WHERE id = ?`).run(String(id));
      return { acknowledged: true };
    },
    async findByIdAndUpdate(id, update, options = {}) {
      return model.findOneAndUpdate({ _id: String(id) }, update, options);
    },
    async findOneAndUpdate(filter, update, options = {}) {
      const existing = model.getAll().find(doc => matches(doc, filter));
      if (!existing) {
        if (!options.upsert) return null;
        const initial = {};
        for (const [key, value] of Object.entries(filter)) {
          if (!key.startsWith('$') && !(value && typeof value === 'object')) setPath(initial, key === '_id' ? '_id' : key, value);
        }
        applyUpdate(initial, update, true);
        return model.insert(initial);
      }
      const previous = clone(existing);
      applyUpdate(existing, update);
      const saved = model.save(existing);
      return options.new || options.returnDocument === 'after' ? saved : decorate(previous, model);
    },
    async updateOne(filter, update, options = {}) {
      const result = await model.findOneAndUpdate(filter, update, { ...options, new: true });
      return { acknowledged: true, matchedCount: result ? 1 : 0, modifiedCount: result ? 1 : 0, upsertedId: result?._id || null };
    }
  };
  return model;
}

export const User = defineModel('cms_users', ['passwordHash']);
export const Content = defineModel('cms_contents');
export const Media = defineModel('cms_media');
export const Activity = defineModel('cms_activities');
export const Contact = defineModel('cms_contacts');

// ─── Session store for express-session ───────────────────────────────

export class SqliteSessionStore extends session.Store {
  get(sid, callback) {
    try {
      const row = getDb().prepare('SELECT data, expires FROM cms_sessions WHERE sid = ?').get(sid);
      if (!row || Number(row.expires) <= Date.now()) {
        if (row) getDb().prepare('DELETE FROM cms_sessions WHERE sid = ?').run(sid);
        return callback(null, null);
      }
      callback(null, JSON.parse(row.data));
    } catch {
      callback(null, null);
    }
  }

  set(sid, value, callback = () => {}) {
    try {
      const expires = value.cookie?.expires ? new Date(value.cookie.expires).getTime() : Date.now() + 8 * 60 * 60 * 1000;
      getDb().prepare(`INSERT OR REPLACE INTO cms_sessions (sid, expires, data) VALUES (?, ?, ?)`)
        .run(sid, expires, JSON.stringify(value));
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  destroy(sid, callback = () => {}) {
    try {
      getDb().prepare('DELETE FROM cms_sessions WHERE sid = ?').run(sid);
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  touch(sid, value, callback = () => {}) {
    try {
      const expires = value.cookie?.expires ? new Date(value.cookie.expires).getTime() : Date.now() + 8 * 60 * 60 * 1000;
      getDb().prepare('UPDATE cms_sessions SET expires = ? WHERE sid = ?').run(expires, sid);
      callback(null);
    } catch (error) {
      callback(error);
    }
  }
}
