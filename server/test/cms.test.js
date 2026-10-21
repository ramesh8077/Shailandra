import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import sharp from 'sharp';
import path from 'node:path';
import { mkdir, readFile } from 'node:fs/promises';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { User, Content, Media } from '../src/models.js';
import { hashPassword } from '../src/security.js';
import { seed } from '../src/seed.js';
process.env.MONGOMS_DOWNLOAD_DIR = path.resolve('../.cms-test-data/mongodb');
const origin = 'http://localhost:5173';
let mongo, app, config, admin, editor, adminToken, editorToken;
const draft = {
  type: 'article',
  title: 'A real CMS story',
  slug: 'a-real-cms-story',
  locale: 'en',
  excerpt: 'An excerpt',
  body: '<p>Hello <strong>India</strong></p>',
  cover: '',
  category: 'Education',
  tags: ['Education'],
  author: 'Public writer',
  seoTitle: '',
  seoDescription: '',
  videoUrl: ''
};
async function login(agent, email) {
  const csrf = (await agent.get('/api/auth/csrf')).body.csrf;
  const response = await agent.post('/api/auth/login').set('Origin', origin).set('X-CSRF-Token', csrf).send({
    email,
    password: 'A-long-test-password-22'
  }).expect(200);
  return response.body.csrf;
}
function write(agent, method, url, token) {
  return agent[method](url).set('Origin', origin).set('X-CSRF-Token', token);
}
before(async () => {
  await mkdir(process.env.MONGOMS_DOWNLOAD_DIR, {
    recursive: true
  });
  mongo = await MongoMemoryServer.create({
    instance: {
      storageEngine: 'wiredTiger'
    }
  });
  config = {
    mongoUri: mongo.getUri('cms-tests'),
    origin,
    secret: 'test-only-secret-with-at-least-32-characters',
    uploadDir: path.resolve('../.cms-test-data/uploads'),
    production: false
  };
  await mongoose.connect(config.mongoUri);
  await Promise.all([User.init(), Content.init(), Media.init()]);
  const passwordHash = await hashPassword('A-long-test-password-22');
  await User.create([{
    email: 'admin@example.test',
    name: 'Administrator',
    passwordHash,
    role: 'administrator'
  }, {
    email: 'editor@example.test',
    name: 'Editor',
    passwordHash,
    role: 'editor'
  }]);
  app = createApp(config);
  admin = request.agent(app);
  editor = request.agent(app);
  adminToken = await login(admin, 'admin@example.test');
  editorToken = await login(editor, 'editor@example.test');
});
after(async () => {
  await app?.locals.sessionStore.close();
  await mongoose.disconnect();
  await mongo?.stop();
});
test('authentication, CSRF and role enforcement', async () => {
  await request(app).get('/api/manage/content').expect(401);
  await request(app).post('/api/manage/content').send({
    kind: 'post',
    draft
  }).expect(403);
  const anonymous = request.agent(app);
  const token = (await anonymous.get('/api/auth/csrf')).body.csrf;
  await write(anonymous, 'post', '/api/manage/content', token).send({
    kind: 'post',
    draft
  }).expect(401);
  await admin.post('/api/manage/content').set('Origin', origin).send({
    kind: 'post',
    draft
  }).expect(403);
  await editor.get('/api/manage/users').expect(403);
  await write(editor, 'post', '/api/manage/users', editorToken).send({}).expect(403);
});
test('save, protected preview, duplicate slugs, publish, draft isolation and unpublish', async () => {
  let doc = (await write(editor, 'post', '/api/manage/content', editorToken).send({
    kind: 'post',
    draft
  }).expect(201)).body;
  await request(app).get(`/api/public/posts/${draft.slug}`).expect(404);
  await request(app).get(`/api/manage/content/${doc._id}`).expect(401);
  await write(editor, 'post', `/api/manage/content/${doc._id}/publish`, editorToken).send({
    revision: 0
  }).expect(403);
  await write(admin, 'post', '/api/manage/content', adminToken).send({
    kind: 'post',
    draft
  }).expect(409);
  doc = (await write(admin, 'post', `/api/manage/content/${doc._id}/publish`, adminToken).send({
    revision: doc.revision
  }).expect(200)).body;
  const published = (await request(app).get(`/api/public/posts/${draft.slug}`).expect(200)).body;
  assert.equal(published.title, draft.title);
  assert.equal(published.updatedBy, undefined);
  assert.equal(published.draft, undefined);
  const changed = {
    ...draft,
    title: 'A private revision',
    body: '<script>alert(1)</script><p>Safe</p><img src="https://evil.test/x"><img src="/api/media/000000000000000000000000" onerror="bad()">'
  };
  await write(editor, 'put', `/api/manage/content/${doc._id}`, editorToken).send({
    revision: doc.revision,
    draft: changed
  }).expect(400);
  changed.body = '<script>alert(1)</script><p>Safe</p>';
  doc = (await write(editor, 'put', `/api/manage/content/${doc._id}`, editorToken).send({
    revision: doc.revision,
    draft: changed
  }).expect(200)).body;
  assert.equal(doc.draft.body, '<p>Safe</p>');
  assert.equal((await request(app).get(`/api/public/posts/${draft.slug}`)).body.title, draft.title);
  await write(editor, 'put', `/api/manage/content/${doc._id}`, editorToken).send({
    revision: 0,
    draft
  }).expect(409);
  doc = (await write(admin, 'post', `/api/manage/content/${doc._id}/publish`, adminToken).send({
    revision: doc.revision
  }).expect(200)).body;
  assert.equal((await request(app).get('/api/public/posts?category=Education')).body.items[0].title, changed.title);
  doc = (await write(admin, 'post', `/api/manage/content/${doc._id}/unpublish`, adminToken).send({
    revision: doc.revision
  }).expect(200)).body;
  await request(app).get(`/api/public/posts/${draft.slug}`).expect(404);
  doc = (await write(admin, 'post', `/api/manage/content/${doc._id}/trash`, adminToken).send({
    revision: doc.revision
  }).expect(200)).body;
  assert.equal(doc.trashed, true);
  doc = (await write(admin, 'post', `/api/manage/content/${doc._id}/restore`, adminToken).send({
    revision: doc.revision
  }).expect(200)).body;
  assert.equal(doc.trashed, false);
  assert.equal(doc.published, null);
});
test('upload signatures, size, privacy, reference protection, replacement and restart persistence', async () => {
  await write(editor, 'post', '/api/manage/media', editorToken).attach('file', Buffer.from('<script>bad()</script>'), 'fake.png').expect(400);
  await write(editor, 'post', '/api/manage/media', editorToken).attach('file', Buffer.alloc(11 * 1024 * 1024), 'huge.png').expect(413);
  const png = await sharp({
    create: {
      width: 8,
      height: 8,
      channels: 3,
      background: '#ff6422'
    }
  }).png().toBuffer();
  const media = (await write(editor, 'post', '/api/manage/media', editorToken).attach('file', png, 'photo.png').expect(201)).body;
  assert.match(media.filename, /^[a-f\d-]+\.webp$/);
  await request(app).get(media.url).expect(404);
  await editor.get(media.url).expect(200);
  let doc = (await write(editor, 'post', '/api/manage/content', editorToken).send({
    kind: 'post',
    draft: {
      ...draft,
      slug: 'image-post',
      cover: media.url
    }
  }).expect(201)).body;
  await request(app).get(media.url).expect(404);
  await write(admin, 'delete', `/api/manage/media/${media._id}`, adminToken).expect(409);
  doc = (await write(admin, 'post', `/api/manage/content/${doc._id}/publish`, adminToken).send({
    revision: doc.revision
  }).expect(200)).body;
  const publicImage = await request(app).get(media.url).expect(200);
  assert.equal(publicImage.headers['content-type'], 'image/webp');
  assert.match(publicImage.headers['cache-control'], /no-store/);
  const replacement = (await write(editor, 'post', '/api/manage/media', editorToken).attach('file', png, 'replacement.png').expect(201)).body;
  doc = (await write(editor, 'put', `/api/manage/content/${doc._id}`, editorToken).send({
    revision: doc.revision,
    draft: {
      ...doc.draft,
      cover: replacement.url
    }
  }).expect(200)).body;
  await request(app).get(replacement.url).expect(404);
  await request(app).get(media.url).expect(200);
  // Recreate the app and database client without recreating stored records or upload files.
  await app.locals.sessionStore.close();
  await mongoose.disconnect();
  await mongoose.connect(config.mongoUri);
  app = createApp(config);
  assert.equal((await request(app).get('/api/public/posts/image-post').expect(200)).body.cover, media.url);
  await request(app).get(media.url).expect(200);
  assert.ok((await readFile(path.join(config.uploadDir, media.filename))).length > 0);
  admin = request.agent(app);
  editor = request.agent(app);
  adminToken = await login(admin, 'admin@example.test');
  editorToken = await login(editor, 'editor@example.test');
  doc = (await write(admin, 'post', `/api/manage/content/${doc._id}/unpublish`, adminToken).send({
    revision: doc.revision
  }).expect(200)).body;
  await request(app).get(media.url).expect(404);
});
test('idempotent migration, explicit section validation and page snapshot isolation', async () => {
  await seed(config);
  const before = await Content.countDocuments();
  await seed(config);
  assert.equal(await Content.countDocuments(), before);
  const site = (await request(app).get('/api/public/site')).body;
  assert.ok(site.sections.Hero.en);
  assert.equal(site.journey.length, 3);
  let doc = await Content.findOne({
    key: 'Hero'
  }).lean();
  const field = Object.keys(doc.draft.en).find(k => !doc.draft.en[k].startsWith('/api/media/'));
  const draftPage = structuredClone(doc.draft);
  draftPage.en[field] = 'Changed through the CMS';
  await write(editor, 'put', `/api/manage/content/${doc._id}`, editorToken).send({
    revision: doc.revision,
    draft: {
      ...draftPage,
      unsupported: 'bad'
    }
  }).expect(400);
  doc = (await write(editor, 'put', `/api/manage/content/${doc._id}`, editorToken).send({
    revision: doc.revision,
    draft: draftPage
  }).expect(200)).body;
  assert.notEqual((await request(app).get('/api/public/site')).body.sections.Hero.en[field], 'Changed through the CMS');
  assert.equal((await editor.get('/api/manage/preview/site')).body.sections.Hero.en[field], 'Changed through the CMS');
  await write(admin, 'post', `/api/manage/content/${doc._id}/publish`, adminToken).send({
    revision: doc.revision
  }).expect(200);
  assert.equal((await request(app).get('/api/public/site')).body.sections.Hero.en[field], 'Changed through the CMS');
});
test('account disabling and logout revoke access', async () => {
  const editorUser = await User.findOne({
    email: 'editor@example.test'
  });
  await write(admin, 'patch', `/api/manage/users/${editorUser._id}`, adminToken).send({
    disabled: true
  }).expect(200);
  await editor.get('/api/manage/content').expect(401);
  await write(admin, 'post', '/api/auth/logout', adminToken).expect(200);
  await admin.get('/api/manage/content').expect(401);
});
