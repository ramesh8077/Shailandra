import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_BASE, api, mediaSrc } from './api';
import { ContentContext as Context, sentenceCase, staticContent } from './contentContext';
import {
  isStaticContentSource,
  mediaAltFor,
  parseStaticSnapshot,
  staticPostPage,
  staticSnapshotUrl
} from './staticSnapshot';

async function fetchJson(url, options = {}, timeoutMs = 3500) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Request failed with HTTP ${response.status}`);
    return await response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

function validLiveSite(site) {
  if (!site || typeof site.sections !== 'object' || !Array.isArray(site.journey)) return false;
  const expectedSections = Object.keys(staticContent.sections);
  if (!expectedSections.every(key => {
    const section = site.sections[key];
    return section &&
      section.en && typeof section.en === 'object' &&
      section.hi && typeof section.hi === 'object' &&
      Object.keys(staticContent.sections[key].en).every(field =>
        typeof section.en[field] === 'string' && typeof section.hi[field] === 'string'
      );
  })) return false;
  return site.journey.every(entry =>
    entry &&
    typeof entry.year === 'string' &&
    typeof entry.title === 'string' &&
    typeof entry.text === 'string' &&
    Number.isInteger(entry.order) &&
    ['en', 'hi'].includes(entry.locale)
  );
}

function sectionImagePaths(content) {
  return Object.fromEntries(Object.entries(content.sections).map(([key, section]) => [
    key,
    section
  ]));
}

export function SectionBoundary({
  name,
  children
}) {
  const context = useContext(Context);
  return context?.sections[name] ? children : <p className="page-wrap py-10">This section is not currently published.</p>;
}

export function PublicCMS({
  children
}) {
  const [locale] = useState('en');
  const [content, setContent] = useState(staticContent);
  const [snapshot, setSnapshot] = useState(null);
  const [snapshotReady, setSnapshotReady] = useState(false);

  useEffect(() => {
    let active = true;
    let reportedSnapshotError = false;
    let currentSnapshot = null;

    const loadSnapshot = async () => {
      try {
        const value = await fetchJson(staticSnapshotUrl(), {
          cache: 'no-store'
        }, 4000);
        const data = parseStaticSnapshot(value);
        if (!active) return;
        currentSnapshot = data;
        setSnapshot(data);
        setContent(current => ({
          sections: {
            ...current.sections,
            ...sectionImagePaths(data)
          },
          journey: data.journey
        }));
      } catch (error) {
        if (active && !reportedSnapshotError) {
          console.warn('The published static snapshot is unavailable; bundled defaults remain in use.', error);
          reportedSnapshotError = true;
        }
      } finally {
        if (active) setSnapshotReady(true);
      }
    };

    const refreshLiveSite = async () => {
      try {
        const site = await fetchJson(`${API_BASE}/api/public/site`, {
          cache: 'no-store'
        });
        if (!validLiveSite(site)) throw new Error('CMS returned incomplete published site content');
        if (currentSnapshot?.journey.length && !site.journey.length) {
          throw new Error('CMS returned no published journey entries while the static snapshot contains them');
        }
        if (active) {
          setContent(current => ({
            sections: {
              ...current.sections,
              ...site.sections
            },
            journey: site.journey
          }));
        }
      } catch (error) {
        if (active) console.warn('Live CMS content is unavailable; the last static snapshot remains in use.', error);
      }
    };

    loadSnapshot();
    if (!isStaticContentSource) {
      refreshLiveSite();
      const refreshInterval = window.setInterval(refreshLiveSite, 15000);
      window.addEventListener('focus', refreshLiveSite);
      return () => {
        active = false;
        window.clearInterval(refreshInterval);
        window.removeEventListener('focus', refreshLiveSite);
      };
    }

    return () => {
      active = false;
    };
  }, []);

  return <Context.Provider value={{
    ...content,
    locale,
    posts: snapshot?.posts || [],
    media: snapshot?.media || {},
    snapshotReady,
    staticSource: isStaticContentSource
  }}>{children}</Context.Provider>;
}

export function PostList({
  type,
  category,
  limit = 6,
  title = 'Latest articles',
  fallbackItems = [],
  layout = 'grid',
  outbound = false,
  imageLightbox = false,
  searchable = true,
  emptyMessage
}) {
  const context = useContext(Context);
  const locale = context?.locale || 'en';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [liveResult, setLiveResult] = useState(null);
  const [liveError, setLiveError] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  useEffect(() => {
    if (!activeImage) return undefined;
    const closeOnEscape = event => {
      if (event.key === 'Escape') setActiveImage(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [activeImage]);
  const staticResult = staticPostPage(context?.posts || [], {
    type,
    category,
    locale,
    search,
    page,
    limit
  });
  const queryKey = JSON.stringify([type, category, locale, search, page, limit]);

  useEffect(() => {
    setLiveResult(null);
    setLiveError(false);
    if (isStaticContentSource) return undefined;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3500);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      locale
    });
    if (type) params.set('type', type);
    if (category) params.set('category', category);
    if (search.trim()) params.set('q', search.trim());

    fetch(`${API_BASE}/api/public/posts?${params}`, {
      cache: 'no-store',
      signal: controller.signal
    }).then(async response => {
      if (!response.ok) throw new Error(`CMS returned HTTP ${response.status}`);
      return response.json();
    }).then(data => {
      if (!data || !Array.isArray(data.items) || !Number.isInteger(data.total) ||
          !Number.isInteger(data.page) || !Number.isInteger(data.limit) ||
          data.items.some(post => !post || typeof post.slug !== 'string' || typeof post.title !== 'string')) {
        throw new Error('CMS returned incomplete post data');
      }
      if ((data.total === 0 || data.total < staticResult.total) && staticResult.total > 0) {
        throw new Error('CMS returned fewer published posts than the static snapshot');
      }
      setLiveResult({
        key: queryKey,
        data
      });
    }).catch(() => {
      if (!controller.signal.aborted) setLiveError(true);
      else setLiveError(true);
    }).finally(() => window.clearTimeout(timeout));

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [category, limit, locale, page, queryKey, search, staticResult.total, type]);

  const livePage = liveResult?.key === queryKey ? liveResult.data : null;
  const result = livePage?.items?.length || staticResult.items.length
    ? livePage || staticResult
    : context?.snapshotReady && !search.trim() && fallbackItems.length
      ? { ...staticResult, items: fallbackItems, total: fallbackItems.length }
      : livePage || staticResult;
  const usingSnapshot = !livePage && staticResult.total > 0;
  const waitingForSnapshot = !livePage && !context?.snapshotReady;
  const hasResults = result.items.length > 0;
  const renderCard = post => {
    const card = <article className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${layout === 'rail' ? 'w-[min(82vw,340px)] shrink-0 snap-start' : ''}`}>
      {post.cover && (imageLightbox ? <button type="button" onClick={() => setActiveImage(post)} aria-label={`Enlarge ${post.title}`} className="group relative block aspect-[4/3] w-full overflow-hidden bg-slate-100 text-left">
        <img src={mediaSrc(post.cover)} alt={mediaAltFor(post.cover, context?.media)} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">View image</span>
      </button> : <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img src={mediaSrc(post.cover)} alt={mediaAltFor(post.cover, context?.media)} loading="lazy" className="h-full w-full object-cover" />
      </div>)}
      <div className="p-5">
        <p className="text-sm font-semibold tracking-wide text-[#f05d25]">{sentenceCase(post.category || post.type)}</p>
        <h3 className="mt-2 text-lg font-bold text-[#10283d]">{sentenceCase(post.title)}</h3>
        {post.excerpt && <p className="mt-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>}
      </div>
    </article>;
    if (imageLightbox) return <div key={post.id || post.slug}>{card}</div>;
    if (outbound) return post.sourceUrl
      ? <a key={post.id || post.slug} href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="block transition hover:-translate-y-0.5">{card}</a>
      : <div key={post.id || post.slug}>{card}</div>;
    return <Link key={post.id || post.slug} to={`/posts/${post.slug}`} className="block transition hover:-translate-y-0.5">{card}</Link>;
  };

  return <section className="section-space bg-white">
    <div className="page-wrap">
      <h2 className="section-title">{sentenceCase(title)}</h2>
      {searchable && <label className="mb-6 block max-w-md text-sm">Search / खोजें<input className="mt-2 w-full rounded border border-slate-300 px-4 py-3" value={search} onChange={event => {
        setSearch(event.target.value);
        setPage(1);
      }} /></label>}
      {usingSnapshot && liveError && !isStaticContentSource && <p role="status" className="mb-4 text-sm text-slate-600">Showing the latest exported content while the live CMS is unavailable.</p>}
      {waitingForSnapshot && !hasResults ? <p role="status" className="text-slate-600">Loading published articles…</p> : hasResults ? <>
        <div className={layout === 'rail' ? 'flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:thin]' : 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'}>
          {result.items.map(renderCard)}
        </div>
        <div className="mt-8 flex items-center justify-center gap-5">
          <button type="button" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button>
          <span>{page} / {Math.max(1, Math.ceil(result.total / result.limit))}</span>
          <button type="button" disabled={page * result.limit >= result.total} onClick={() => setPage(value => value + 1)}>Next</button>
        </div>
      </> : <p role="status" className="text-slate-600">{liveError && !context?.posts?.length && !isStaticContentSource ? 'Published articles are temporarily unavailable, and no static snapshot is available.' : emptyMessage || 'No published posts yet.'}</p>}
      {activeImage && <div role="dialog" aria-modal="true" aria-label={activeImage.title} onClick={event => event.target === event.currentTarget && setActiveImage(null)} className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onKeyDown={event => event.key === 'Escape' && setActiveImage(null)}>
        <div className="relative max-h-full max-w-6xl rounded-xl bg-white p-3 shadow-2xl">
          <button type="button" onClick={() => setActiveImage(null)} aria-label="Close enlarged image" className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/70 text-2xl text-white">×</button>
          <img src={mediaSrc(activeImage.cover)} alt={mediaAltFor(activeImage.cover, context?.media)} className="max-h-[85vh] max-w-full rounded-lg object-contain" />
          <p className="px-2 py-3 text-sm font-semibold text-[#10283d]">{activeImage.title}</p>
        </div>
      </div>}
    </div>
  </section>;
}

export function PostDetail({
  preview = false
}) {
  const {
    slug,
    id
  } = useParams();
  const context = useContext(Context);
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setPost(null);
    setError('');

    if (!preview) {
      const published = context?.posts.find(entry => entry.slug === slug);
      if (published) setPost(published);

      if (isStaticContentSource) {
        if (context?.snapshotReady && !published) {
          setError('This published article is not in the current static export.');
        }
        return () => {
          active = false;
        };
      }

    }

    if (preview) {
      api(`/manage/content/${id}`).then(document => {
        if (active) setPost(document.draft);
      }).catch(requestError => {
        if (active) setError(requestError.message || 'The article could not be loaded.');
      });
      return () => {
        active = false;
      };
    }

    fetchJson(`${API_BASE}/api/public/posts/${encodeURIComponent(slug)}`, {
        cache: 'no-store'
      }).then(data => {
        if (active) {
          setPost(data);
          setError('');
        }
      }).catch(requestError => {
        if (active && !context?.posts.some(entry => entry.slug === slug) && context?.snapshotReady) {
          setError(requestError.message || 'The article could not be loaded.');
        }
    });

    return () => {
      active = false;
    };
  }, [context?.posts, context?.snapshotReady, id, preview, slug]);

  useEffect(() => {
    if (!post || preview) return undefined;
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute('content');
    document.title = post.seoTitle || post.title || previousTitle;
    if (description && post.seoDescription) description.setAttribute('content', post.seoDescription);
    return () => {
      document.title = previousTitle;
      if (description && previousDescription !== null) description.setAttribute('content', previousDescription);
    };
  }, [post, preview]);

  if (error) return <main className="page-wrap py-20"><p role="alert">{error}</p></main>;
  if (!post) return <main className="page-wrap py-20"><p role="status">Loading article…</p></main>;

  return <main className="page-wrap section-space"><article className="mx-auto max-w-3xl"><p className="text-sm font-semibold tracking-wide text-[#f05d25]">{sentenceCase(post.category || post.type)}</p><h1 className="mt-3 text-3xl font-extrabold text-[#10283d] md:text-5xl">{sentenceCase(post.title)}</h1>{post.excerpt && <p className="mt-5 text-lg leading-8 text-slate-600">{post.excerpt}</p>}{post.videoUrl && <div className="mt-8 aspect-video overflow-hidden rounded-xl bg-black"><iframe src={post.videoUrl} title={post.title} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>}{post.cover && !post.videoUrl && <img className="mt-8 max-h-[32rem] w-full rounded-xl object-cover" src={mediaSrc(post.cover)} alt={mediaAltFor(post.cover, context?.media)} />}<div className="post-body mt-8 leading-8" dangerouslySetInnerHTML={{
      __html: isStaticContentSource ? post.body : post.body.replace(/(["'(])\/api\/media\//g, `$1${API_BASE}/api/media/`)
    }} /></article></main>;
}
