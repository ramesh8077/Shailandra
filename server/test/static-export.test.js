import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { manifest } from '../src/validation.js';
import { createStaticSnapshot } from '../src/staticExport.js';
import { buildStaticSite } from '../src/staticBuild.js';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const mediaId = 'a'.repeat(24);
const mediaFilename = '12345678-1234-4234-9234-123456789abc.webp';
const postBody = `<p>Published text <strong>with formatting</strong>.</p><p><img src="/api/media/${mediaId}" alt="A published photograph"></p>`;

function localizedHero() {
  const section = manifest.sections.Hero;
  const values = language => Object.fromEntries(Object.entries(section.fields).map(([key, definition]) => [
    key,
    definition.type === 'image'
      ? `/api/media/${mediaId}`
      : (language === 'hi' ? definition.hiValue ?? definition.value : definition.value) || ''
  ]));
  return {
    kind: section.kind,
    key: 'Hero',
    published: {
      en: values('en'),
      hi: values('hi')
    },
    publishedAt: new Date('2026-10-20T08:00:00.000Z'),
    trashed: false,
    draft: {
      privateNote: 'PRIVATE DRAFT MUST NOT BE EXPORTED'
    }
  };
}

function publishedPost({
  id,
  slug,
  locale,
  title
}) {
  return {
    _id: id,
    kind: 'post',
    key: `post-${slug}`,
    published: {
      type: 'article',
      title,
      slug,
      locale,
      excerpt: 'Published excerpt',
      body: postBody,
      cover: `/api/media/${mediaId}`,
      category: 'Education',
      tags: ['Education'],
      author: 'Public author',
      seoTitle: `${title} | SEO`,
      seoDescription: 'Published SEO description',
      videoUrl: ''
    },
    publishedAt: new Date('2026-10-22T10:00:00.000Z'),
    trashed: false,
    draft: {
      title: 'PRIVATE POST DRAFT MUST NOT BE EXPORTED',
      passwordHash: 'PRIVATE TEST SENTINEL'
    }
  };
}

function journeyRecord(id, locale, order) {
  return {
    _id: id,
    kind: 'journey',
    key: `journey-${id}`,
    published: {
      year: locale === 'hi' ? '२०२४' : '2024',
      title: locale === 'hi' ? 'प्रकाशित यात्रा' : 'Published journey',
      text: locale === 'hi' ? 'हिंदी सामग्री' : 'English content',
      order,
      locale
    },
    publishedAt: new Date('2026-10-21T10:00:00.000Z'),
    trashed: false
  };
}

function mockModels(records, media) {
  let contentFilter;
  let contentProjection;
  let mediaFilter;
  return {
    Content: {
      find(filter) {
        contentFilter = filter;
        return {
          select(projection) {
            contentProjection = projection;
            return this;
          },
          async lean() {
            return records.filter(record =>
              filter.kind.$in.includes(record.kind) &&
              record.trashed === filter.trashed &&
              record.published !== null &&
              record.published !== undefined
            );
          }
        };
      }
    },
    Media: {
      find(filter) {
        mediaFilter = filter;
        return {
          select() {
            return this;
          },
          async lean() {
            const ids = new Set(filter._id.$in.map(String));
            return media.filter(item => ids.has(String(item._id)));
          }
        };
      }
    },
    assertions() {
      assert.deepEqual(contentFilter, {
        kind: { $in: ['page', 'settings', 'journey', 'post'] },
        trashed: false,
        published: { $ne: null }
      });
      assert.equal(Object.hasOwn(contentProjection, 'draft'), false);
      assert.equal(Object.hasOwn(contentProjection, 'published'), true);
      assert.equal(mediaFilter._id.$in.length, 1);
    }
  };
}

async function makeFixture(t, {
  withMedia = true,
  keep = false
} = {}) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'shalinder-static-export-test-'));
  if (!keep) t.after(() => rm(directory, { recursive: true, force: true }));
  const uploads = path.join(directory, 'uploads');
  const data = path.join(directory, 'public-data');
  await mkdir(uploads, { recursive: true });
  await mkdir(data, { recursive: true });

  const published = [
    localizedHero(),
    journeyRecord('journey-en', 'en', 0),
    journeyRecord('journey-hi', 'hi', 1),
    publishedPost({
      id: 'published-en',
      slug: 'published-story',
      locale: 'en',
      title: 'Published story'
    }),
    publishedPost({
      id: 'published-hi',
      slug: 'prakashit-kahani',
      locale: 'hi',
      title: 'प्रकाशित कहानी'
    })
  ];
  const excluded = [
    {
      kind: 'post',
      key: 'draft-only',
      trashed: false,
      published: null,
      draft: {
        title: 'DRAFT MUST NOT BE EXPORTED',
        passwordHash: 'DRAFT SECRET SENTINEL'
      }
    },
    {
      kind: 'post',
      key: 'trashed-published',
      trashed: true,
      published: publishedPost({
        id: 'trashed-post',
        slug: 'trashed-story',
        locale: 'en',
        title: 'TRASHED MUST NOT BE EXPORTED'
      }).published
    }
  ];
  const records = [...published, ...excluded];
  const media = [{
    _id: mediaId,
    filename: mediaFilename,
    mime: 'image/webp',
    size: 0,
    width: 2,
    height: 2,
    alt: 'Published landscape photograph',
    originalName: 'PRIVATE ORIGINAL FILENAME'
  }];
  if (withMedia) {
    await sharp({
      create: {
        width: 2,
        height: 2,
        channels: 3,
        background: '#e75b22'
      }
    }).webp().toFile(path.join(uploads, mediaFilename));
  }
  return {
    directory,
    uploads,
    data,
    records,
    media,
    models: mockModels(records, media)
  };
}

test('exports only published localized content and referenced images, then builds a separate static site', async t => {
  const keep = process.env.KEEP_STATIC_EXPORT_TEST_OUTPUT === '1';
  const fixture = await makeFixture(t, { keep });
  const productionIndex = path.join(root, 'dist', 'index.html');
  const productionIndexHash = await readFile(productionIndex).then(data => data.toString('base64'));
  const result = await createStaticSnapshot({
    ...fixture.models,
    uploadDir: fixture.uploads,
    dataDir: fixture.data,
    forbiddenValues: ['TEST-ONLY-CONNECTION-STRING', 'TEST-ONLY-SESSION-SECRET']
  });
  fixture.models.assertions();

  assert.equal(result.pages, 1);
  assert.equal(result.journeyEntries, 2);
  assert.equal(result.posts, 2);
  assert.equal(result.mediaFiles, 1);
  assert.equal(result.snapshot.sections.Hero.en.f1.startsWith('/site-assets/'), true);
  assert.equal(result.snapshot.journey.some(entry => entry.locale === 'hi'), true);
  assert.equal(result.snapshot.posts.some(post => post.locale === 'hi'), true);
  assert.match(result.snapshot.posts[0].body, /<strong>with formatting<\/strong>/);
  assert.match(result.snapshot.posts[0].body, /alt="A published photograph"/);
  assert.match(result.snapshot.posts[0].body, /src="\/site-assets\//);
  assert.equal(result.snapshot.posts[0].seoTitle, 'Published story | SEO');

  const json = await readFile(path.join(fixture.data, 'content-snapshot.json'), 'utf8');
  assert.equal(json.includes('PRIVATE DRAFT MUST NOT BE EXPORTED'), false);
  assert.equal(json.includes('PRIVATE POST DRAFT MUST NOT BE EXPORTED'), false);
  assert.equal(json.includes('DRAFT MUST NOT BE EXPORTED'), false);
  assert.equal(json.includes('TRASHED MUST NOT BE EXPORTED'), false);
  assert.equal(json.includes('passwordHash'), false);
  assert.equal(json.includes('PRIVATE ORIGINAL FILENAME'), false);
  assert.equal(json.includes('/api/media/'), false);

  const copiedImage = path.join(fixture.data, 'site-assets', `${mediaId}.webp`);
  assert.equal((await stat(copiedImage)).isFile(), true);
  await copyFile(path.join(root, 'public', '.htaccess'), path.join(fixture.data, '.htaccess'));

  const buildOutput = path.join(fixture.directory, 'static-site');
  await buildStaticSite({
    root,
    publicDir: fixture.data,
    outDir: buildOutput
  });
  assert.equal((await stat(path.join(buildOutput, 'index.html'))).isFile(), true);
  assert.equal((await stat(path.join(buildOutput, 'content-snapshot.json'))).isFile(), true);
  assert.equal((await stat(path.join(buildOutput, '.htaccess'))).isFile(), true);
  assert.equal((await stat(path.join(buildOutput, 'site-assets', `${mediaId}.webp`))).isFile(), true);
  assert.equal(
    await readFile(productionIndex).then(data => data.toString('base64')),
    productionIndexHash,
    'the current production dist index must not be changed'
  );
  if (keep) console.log(`STATIC_EXPORT_TEST_OUTPUT=${buildOutput}`);
});

test('fails safely if any published content references a missing image file', async t => {
  const fixture = await makeFixture(t, { withMedia: false });
  await assert.rejects(
    createStaticSnapshot({
      ...fixture.models,
      uploadDir: fixture.uploads,
      dataDir: fixture.data
    }),
    /Referenced image file is missing|Published content references missing media metadata/
  );
  await assert.rejects(
    readFile(path.join(fixture.data, 'content-snapshot.json')),
    error => error.code === 'ENOENT'
  );
});

test('rejects unsafe output fields and duplicate published slugs before writing a snapshot', async t => {
  const fixture = await makeFixture(t);
  fixture.records.push({
    ...publishedPost({
      id: 'duplicate-post',
      slug: 'published-story',
      locale: 'hi',
      title: 'Duplicate slug'
    })
  });
  fixture.models = mockModels(fixture.records, fixture.media);
  await assert.rejects(
    createStaticSnapshot({
      ...fixture.models,
      uploadDir: fixture.uploads,
      dataDir: fixture.data
    }),
    /Duplicate published post slug/
  );
  await assert.rejects(
    readFile(path.join(fixture.data, 'content-snapshot.json')),
    error => error.code === 'ENOENT'
  );
});

test('rejects a connection string or configured secret in published copy without writing it', async t => {
  const fixture = await makeFixture(t);
  const textField = Object.entries(manifest.sections.Hero.fields).find(([, definition]) => definition.type === 'text')[0];
  fixture.records[0].published.en[textField] = 'mongodb+srv://should-not-appear.example';
  fixture.models = mockModels(fixture.records, fixture.media);
  await assert.rejects(
    createStaticSnapshot({
      ...fixture.models,
      uploadDir: fixture.uploads,
      dataDir: fixture.data,
      forbiddenValues: ['TEST-ONLY-SESSION-SECRET']
    }),
    /Connection string found/
  );
  await assert.rejects(
    readFile(path.join(fixture.data, 'content-snapshot.json')),
    error => error.code === 'ENOENT'
  );
});
