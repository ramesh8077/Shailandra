import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { manifest, validateContent } from './validation.js';

const mediaReference = /\/api\/media\/([^"'()\s<>?#]+)/g;
const sensitiveKeys = /^(?:draft|trashed|password(?:hash)?|sessions?|csrf|tokens?|secret|mongo(?:uri)?|uploaddir|env)$/i;
const connectionString = /mongodb(?:\+srv)?:\/\//i;

function requirePlainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function collectMediaIds(value, ids = new Set()) {
  if (typeof value === 'string') {
    for (const match of value.matchAll(mediaReference)) {
      const id = match[1].toLowerCase();
      if (!/^[a-f\d]{24}$/.test(id)) {
        throw new Error(`Invalid media reference: /api/media/${match[1]}`);
      }
      ids.add(id);
    }
  } else if (Array.isArray(value)) {
    for (const item of value) collectMediaIds(item, ids);
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectMediaIds(item, ids);
  }
  return ids;
}

function collectLocalAssetIds(value, ids = new Set()) {
  if (typeof value === 'string') {
    if (value.includes('/api/media/')) {
      throw new Error('An API media reference remains in the exported snapshot');
    }
    for (const match of value.matchAll(/\/site-assets\/([a-f\d]{24})\.webp(?![\w.-])/gi)) {
      ids.add(match[1].toLowerCase());
    }
  } else if (Array.isArray(value)) {
    for (const item of value) collectLocalAssetIds(item, ids);
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectLocalAssetIds(item, ids);
  }
  return ids;
}

function rewriteMedia(value, mediaPaths) {
  if (typeof value === 'string') {
    const rewritten = value.replace(mediaReference, (_match, rawId) => {
      const src = mediaPaths.get(rawId.toLowerCase());
      if (!src) throw new Error(`No exported image for media reference ${rawId}`);
      return src;
    });
    if (rewritten.includes('/api/media/')) {
      throw new Error('A media API reference could not be rewritten');
    }
    return rewritten;
  }
  if (Array.isArray(value)) return value.map(item => rewriteMedia(item, mediaPaths));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      rewriteMedia(item, mediaPaths)
    ]));
  }
  return value;
}

function assertSafeData(value, forbiddenValues = [], keyPath = '$') {
  if (typeof value === 'string') {
    if (connectionString.test(value)) throw new Error(`Connection string found in exported data at ${keyPath}`);
    if (forbiddenValues.some(secret => secret && value.includes(secret))) {
      throw new Error(`Configured secret found in exported data at ${keyPath}`);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertSafeData(item, forbiddenValues, `${keyPath}[${index}]`));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (sensitiveKeys.test(key)) throw new Error(`Sensitive field "${key}" found in exported data at ${keyPath}`);
      assertSafeData(item, forbiddenValues, `${keyPath}.${key}`);
    }
  }
}

function comparePublishedOrder(left, right) {
  const locale = String(left.locale).localeCompare(String(right.locale));
  return locale || left.order - right.order;
}

function normalizePublishedRecords(records) {
  const sections = {};
  const journey = [];
  const posts = [];
  const slugs = new Set();

  for (const record of records) {
    if (!record || record.trashed || !record.published) {
      throw new Error('The published-content query returned an unpublished or trashed record');
    }
    if (typeof record.key !== 'string' || !record.key) {
      throw new Error('A published content record is missing its key');
    }
    if (record.kind === 'page' || record.kind === 'settings') {
      if (!manifest.sections[record.key] || manifest.sections[record.key].kind !== record.kind) {
        throw new Error(`Published section "${record.key}" is not present in the content manifest`);
      }
      if (sections[record.key]) throw new Error(`Duplicate published section key "${record.key}"`);
      sections[record.key] = validateContent(record.kind, record.key, record.published);
    } else if (record.kind === 'journey') {
      journey.push(validateContent('journey', record.key, record.published));
    } else if (record.kind === 'post') {
      const published = validateContent('post', record.key, record.published);
      if (slugs.has(published.slug)) throw new Error(`Duplicate published post slug "${published.slug}"`);
      slugs.add(published.slug);
      posts.push({
        id: String(record._id),
        ...published,
        publishedAt: record.publishedAt ? new Date(record.publishedAt).toISOString() : null
      });
    } else {
      throw new Error(`Unsupported published content kind "${record.kind}"`);
    }
  }

  journey.sort(comparePublishedOrder);
  posts.sort((left, right) => String(right.publishedAt || '').localeCompare(String(left.publishedAt || '')));
  return {
    sections,
    journey,
    posts
  };
}

async function sha256(filePath) {
  return createHash('sha256').update(await readFile(filePath)).digest('hex');
}

function verifySnapshot(snapshot, copiedAssets, mediaPaths, requiredMediaIds) {
  requirePlainObject(snapshot, 'Snapshot');
  requirePlainObject(snapshot.sections, 'Snapshot sections');
  requirePlainObject(snapshot.media, 'Snapshot media');
  if (!Array.isArray(snapshot.journey) || !Array.isArray(snapshot.posts)) {
    throw new Error('Snapshot journey and posts must be arrays');
  }
  if (Object.keys(snapshot.sections).length === 0) {
    throw new Error('No published pages or settings were found to export');
  }
  for (const section of Object.values(snapshot.sections)) {
    requirePlainObject(section.en, 'Published section English content');
    requirePlainObject(section.hi, 'Published section Hindi content');
  }
  const referencedIds = collectLocalAssetIds({
    sections: snapshot.sections,
    journey: snapshot.journey,
    posts: snapshot.posts,
    media: snapshot.media
  });
  if (referencedIds.size !== requiredMediaIds.size || [...referencedIds].some(id => !requiredMediaIds.has(id))) {
    throw new Error('Rewritten local media references do not match the selected media set');
  }
  for (const id of referencedIds) {
    if (!snapshot.media[id] || !mediaPaths.has(id) || !copiedAssets.has(id)) {
      throw new Error(`Exported media ${id} is missing metadata or a copied file`);
    }
  }
}

export async function createStaticSnapshot({
  Content,
  Media,
  uploadDir,
  dataDir,
  forbiddenValues = []
}) {
  if (!Content?.find || !Media?.find) throw new Error('CMS content and media models are required');
  if (!uploadDir || !dataDir) throw new Error('Upload and snapshot directories are required');

  const records = await Content.find({
    kind: { $in: ['page', 'settings', 'journey', 'post'] },
    trashed: false,
    published: { $ne: null }
  }).select({
    kind: 1,
    key: 1,
    published: 1,
    publishedAt: 1,
    trashed: 1
  }).lean();
  if (!Array.isArray(records)) throw new Error('Published-content query did not return a record list');

  const normalized = normalizePublishedRecords(records);
  const requiredMediaIds = collectMediaIds(normalized);
  const mediaRecords = requiredMediaIds.size
    ? await Media.find({ _id: { $in: [...requiredMediaIds] } }).select({
      _id: 1,
      filename: 1,
      mime: 1,
      size: 1,
      width: 1,
      height: 1,
      alt: 1
    }).lean()
    : [];
  if (!Array.isArray(mediaRecords)) throw new Error('Media query did not return a record list');

  const mediaById = new Map();
  for (const media of mediaRecords) {
    const id = String(media._id).toLowerCase();
    if (!requiredMediaIds.has(id)) continue;
    if (!media.filename || path.basename(media.filename) !== media.filename || !/^[\w-]+\.webp$/i.test(media.filename)) {
      throw new Error(`Media ${id} has an unsafe or unsupported stored filename`);
    }
    if (media.mime !== 'image/webp') throw new Error(`Media ${id} is not a supported WebP image`);
    mediaById.set(id, media);
  }

  for (const id of requiredMediaIds) {
    if (!mediaById.has(id)) throw new Error(`Published content references missing media metadata: ${id}`);
  }

  const uploadRoot = path.resolve(uploadDir);
  const dataRoot = path.resolve(dataDir);
  const mediaPaths = new Map();
  const mediaMetadata = {};
  const copiedAssets = new Set();
  await mkdir(path.join(dataRoot, 'site-assets'), { recursive: true });

  for (const id of [...requiredMediaIds].sort()) {
    const media = mediaById.get(id);
    const sourcePath = path.resolve(uploadRoot, media.filename);
    if (path.dirname(sourcePath) !== uploadRoot) throw new Error(`Media ${id} resolves outside the upload directory`);
    const sourceStat = await stat(sourcePath).catch(error => {
      if (error.code === 'ENOENT') throw new Error(`Referenced image file is missing: ${media.filename}`);
      throw error;
    });
    if (!sourceStat.isFile()) throw new Error(`Referenced media is not a file: ${media.filename}`);

    const src = `/site-assets/${id}.webp`;
    const destinationPath = path.join(dataRoot, 'site-assets', `${id}.webp`);
    await copyFile(sourcePath, destinationPath);
    const [sourceHash, destinationHash, destinationStat] = await Promise.all([
      sha256(sourcePath),
      sha256(destinationPath),
      stat(destinationPath)
    ]);
    if (sourceHash !== destinationHash || sourceStat.size !== destinationStat.size) {
      throw new Error(`Copied image verification failed for media ${id}`);
    }

    mediaPaths.set(id, src);
    copiedAssets.add(id);
    mediaMetadata[id] = {
      src,
      alt: typeof media.alt === 'string' ? media.alt : '',
      mime: media.mime,
      size: destinationStat.size,
      width: media.width,
      height: media.height
    };
  }

  const snapshot = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    sections: rewriteMedia(normalized.sections, mediaPaths),
    journey: rewriteMedia(normalized.journey, mediaPaths),
    posts: rewriteMedia(normalized.posts, mediaPaths),
    media: mediaMetadata
  };
  verifySnapshot(snapshot, copiedAssets, mediaPaths, requiredMediaIds);
  assertSafeData(snapshot, forbiddenValues);

  const json = JSON.stringify(snapshot, null, 2);
  const reparsed = JSON.parse(json);
  verifySnapshot(reparsed, copiedAssets, mediaPaths, requiredMediaIds);
  assertSafeData(reparsed, forbiddenValues);
  await writeFile(path.join(dataRoot, 'content-snapshot.json'), json, {
    encoding: 'utf8',
    flag: 'wx'
  });

  return {
    pages: Object.keys(snapshot.sections).length,
    journeyEntries: snapshot.journey.length,
    posts: snapshot.posts.length,
    mediaFiles: copiedAssets.size,
    mediaBytes: Object.values(snapshot.media).reduce((total, item) => total + item.size, 0),
    snapshot
  };
}
