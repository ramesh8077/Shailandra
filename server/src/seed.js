import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { Content, Media } from './models.js';
import { manifest, validateContent } from './validation.js';
import { mediaRefs } from './security.js';
const root = fileURLToPath(new URL('../../', import.meta.url));
export async function seed(config) {
  await mkdir(config.uploadDir, {
    recursive: true
  });
  const assets = {};
  for (const asset of Object.keys(manifest.assets)) {
    let doc = await Media.findOne({
      legacyKey: asset
    });
    if (!doc) {
      const filename = `${randomUUID()}.webp`;
      const info = await sharp(path.join(root, asset)).rotate().resize({
        width: 2400,
        height: 2400,
        fit: 'inside',
        withoutEnlargement: true
      }).webp({
        quality: 85
      }).toFile(path.join(config.uploadDir, filename));
      try {
        doc = await Media.create({
          filename,
          legacyKey: asset,
          originalName: path.basename(asset),
          mime: 'image/webp',
          size: info.size,
          width: info.width,
          height: info.height,
          alt: path.basename(asset, path.extname(asset))
        });
      } catch (error) {
        await unlink(path.join(config.uploadDir, filename));
        throw error;
      }
    }
    assets[asset] = `/api/media/${doc._id}`;
  }
  for (const [key, section] of Object.entries(manifest.sections)) {
    const en = Object.fromEntries(Object.entries(section.fields).map(([key, f]) => [key, f.type === 'image' ? assets[f.value] : f.value]));
    const hi = Object.fromEntries(Object.entries(section.fields).map(([key, f]) => [key, f.type === 'image' ? assets[f.value] : f.hiValue ?? f.value]));
    const draft = validateContent(section.kind, key, {
      en,
      hi
    });
    await Content.updateOne({
      key
    }, {
      $setOnInsert: {
        kind: section.kind,
        key,
        draft,
        published: draft,
        draftMedia: mediaRefs(draft),
        publishedMedia: mediaRefs(draft),
        publishedAt: new Date(),
        revision: 0,
        trashed: false
      }
    }, {
      upsert: true
    });
  }
  for (const [order, entry] of manifest.journey.entries()) {
    const key = `legacy-journey-${order}`,
      draft = validateContent('journey', key, {
        ...entry,
        order,
        locale: 'en'
      });
    await Content.updateOne({
      key
    }, {
      $setOnInsert: {
        kind: 'journey',
        key,
        draft,
        published: draft,
        publishedAt: new Date(),
        revision: 0,
        trashed: false
      }
    }, {
      upsert: true
    });
  }
  // Placeholder article cards had no article bodies. Keep them as reviewable drafts, never invent published stories.
  for (const [i, title] of ['The Impact of Color Psychology in Design', 'Leadership for a Stronger Tomorrow', 'People at the Heart of Progress'].entries()) {
    const key = `legacy-blog-${i}`;
    const draft = validateContent('post', key, {
      type: 'article',
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      locale: 'en',
      excerpt: '',
      body: '',
      cover: assets[`src/assets/Home-Images/blog${i+1}.png`],
      category: '',
      tags: [],
      author: 'Shalinder',
      seoTitle: '',
      seoDescription: '',
      videoUrl: ''
    });
    await Content.updateOne({
      key
    }, {
      $setOnInsert: {
        kind: 'post',
        key,
        draft,
        draftMedia: mediaRefs(draft),
        revision: 0,
        trashed: false
      }
    }, {
      upsert: true
    });
  }
  console.log('Seed complete. Existing records were left unchanged. Review legacy copy and translate Hindi fields before publication.');
}
