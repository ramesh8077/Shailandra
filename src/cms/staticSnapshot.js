const assetBase = import.meta.env.BASE_URL || '/';

export const isStaticContentSource = import.meta.env.VITE_CONTENT_SOURCE === 'static';

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateLocalizedSections(sections) {
  if (!isObject(sections)) return false;
  for (const section of Object.values(sections)) {
    if (!isObject(section) || !isObject(section.en) || !isObject(section.hi)) return false;
  }
  return true;
}

function validateJourney(journey) {
  return Array.isArray(journey) && journey.every(entry =>
    isObject(entry) &&
    typeof entry.year === 'string' &&
    typeof entry.title === 'string' &&
    typeof entry.text === 'string' &&
    Number.isInteger(entry.order) &&
    ['en', 'hi'].includes(entry.locale)
  );
}

function validatePosts(posts) {
  return Array.isArray(posts) && posts.every(post =>
    isObject(post) &&
    typeof post.id === 'string' &&
    typeof post.slug === 'string' &&
    typeof post.title === 'string' &&
    ['article', 'news', 'video'].includes(post.type) &&
    ['en', 'hi'].includes(post.locale) &&
    typeof post.body === 'string'
  );
}

function validateMedia(media) {
  if (!isObject(media)) return false;
  return Object.values(media).every(item =>
    isObject(item) &&
    typeof item.src === 'string' &&
    item.src.startsWith('/site-assets/') &&
    typeof item.alt === 'string' &&
    item.mime === 'image/webp'
  );
}

function addAssetBase(value) {
  if (typeof value === 'string') {
    if (value.includes('/api/media/')) throw new Error('The static snapshot contains a live media API reference');
    return value.replace(/(^|["'(])\/site-assets\//g, (_match, prefix) =>
      `${prefix}${assetBase.replace(/\/?$/, '/') }site-assets/`
    );
  }
  if (Array.isArray(value)) return value.map(addAssetBase);
  if (isObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, addAssetBase(item)]));
  }
  return value;
}

export function parseStaticSnapshot(value) {
  if (!isObject(value) || value.schemaVersion !== 1) {
    throw new Error('Static content snapshot has an unsupported format');
  }
  if (!validateLocalizedSections(value.sections)) {
    throw new Error('Static content snapshot has invalid page sections');
  }
  if (!validateJourney(value.journey)) {
    throw new Error('Static content snapshot has invalid journey entries');
  }
  if (!validatePosts(value.posts)) {
    throw new Error('Static content snapshot has invalid published posts');
  }
  if (!validateMedia(value.media)) {
    throw new Error('Static content snapshot has invalid media metadata');
  }

  const snapshot = {
    ...value,
    sections: addAssetBase(value.sections),
    journey: addAssetBase(value.journey),
    posts: addAssetBase(value.posts),
    media: addAssetBase(value.media)
  };
  const mediaPaths = new Set(Object.entries(snapshot.media).map(([id, item]) => [
    `/site-assets/${id}.webp`,
    item.src
  ]).flat());
  const content = JSON.stringify({
    sections: value.sections,
    journey: value.journey,
    posts: value.posts
  });
  for (const match of content.matchAll(/\/site-assets\/[a-f\d]{24}\.webp/gi)) {
    if (!mediaPaths.has(match[0])) throw new Error(`Static content references missing image ${match[0]}`);
  }
  for (const [id, item] of Object.entries(value.media)) {
    if (item.src !== `/site-assets/${id}.webp`) throw new Error(`Static media metadata has an invalid image path for ${id}`);
  }
  return snapshot;
}

export function staticSnapshotUrl() {
  return `${assetBase.replace(/\/?$/, '/')}content-snapshot.json`;
}

export function staticPostPage(posts, {
  type,
  category,
  tag,
  locale,
  search,
  page,
  limit
}) {
  const query = search.trim().toLocaleLowerCase();
  const filtered = posts.filter(post =>
    post.locale === locale &&
    (!type || post.type === type) &&
    (!category || post.category === category) &&
    (!tag || post.tags.some(value => value.toLocaleLowerCase() === tag.toLocaleLowerCase())) &&
    (!query || `${post.title} ${post.excerpt} ${post.category} ${post.tags.join(' ')}`.toLocaleLowerCase().includes(query))
  );
  const start = (page - 1) * limit;
  return {
    items: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit
  };
}

export function mediaAltFor(url, media) {
  if (!url || !media) return '';
  const id = url.match(/\/(?:api\/media\/|site-assets\/)([a-f\d]{24})(?:\.webp)?$/i)?.[1]?.toLowerCase();
  return (id && media[id]?.alt) || Object.values(media).find(item => item.src === url)?.alt || '';
}
