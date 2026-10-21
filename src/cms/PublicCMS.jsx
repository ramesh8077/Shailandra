import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api, mediaSrc } from './api';
import { ContentContext as Context } from './contentContext';
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
  const location = useLocation();
  const [result, setResult] = useState({}),
    [locale, setLocale] = useState('en');
  const preview = new URLSearchParams(location.search).get('preview') === 'draft';
  const {data,error}=result.preview===preview?result:{};
  useEffect(() => {
    let active = true;
    const refresh = () => api(preview ? '/manage/preview/site' : '/public/site').then(result => {
      if (active) {
        setResult({preview,data:result});
      }
    }).catch(e => {
      if (active) {
        setResult({preview,error:e.message});
      }
    });
    refresh();
    const timer = setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [location.pathname, preview]);
  if (error) return <main className="page-wrap py-20" role="alert"><h1 className="section-title">Content is unavailable</h1><p>{error}</p><button onClick={() => window.location.reload()}>Try again</button></main>;
  if (!data) return <p className="page-wrap py-20" role="status">Loading…</p>;
  if (!Object.keys(data.sections).length) return <p className="page-wrap py-20">No page content has been published yet.</p>;
  return <Context.Provider value={{
    ...data,
    locale
  }}><div className="flex justify-end gap-3 bg-slate-50 px-6 py-1 text-sm">{preview && <strong>Protected draft preview</strong>}<label>Language / भाषा <select aria-label="Language" value={locale} onChange={e => setLocale(e.target.value)}><option value="en">English</option><option value="hi">हिन्दी</option></select></label></div>{children}</Context.Provider>;
}
export function PostList({
  type,
  category,
  limit = 6,
  title = 'Latest articles'
}) {
  const location = useLocation();
  category ||= new URLSearchParams(location.search).get('category') || undefined;
  const context = useContext(Context),
    locale = context?.locale || 'en';
  const [result, setResult] = useState({}),
    [page, setPage] = useState(1),
    [q, setQ] = useState('');
  const listKey=JSON.stringify([type,category,page,limit,locale,q]);
  const {data,error}=result.listKey===listKey?result:{};
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      page,
      limit,
      locale,
      q,
      ...(type ? {
        type
      } : {}),
      ...(category ? {
        category
      } : {})
    });
    const refresh = () => api(`/public/posts?${params}`).then(d => {
      if (active) {
        setResult({listKey,data:d});
      }
    }).catch(e => {
      if (active) {
        setResult({listKey,error:e.message});
      }
    });
    refresh();
    const timer = setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [type, category, page, limit, locale, q, listKey]);
  return <section className="section-space bg-white"><div className="page-wrap"><h2 className="section-title">{title}</h2><label className="block mb-6">Search / खोजें <input className="rounded border p-2" value={q} onChange={e => {
          setQ(e.target.value);
          setPage(1);
        }} /></label>{error ? <p role="alert">{error}</p> : !data ? <p role="status">Loading…</p> : <>{!data.items.length && <p>No published posts yet.</p>}<div className="grid gap-8 md:grid-cols-3">{data.items.map(post => <article key={post.id} className="group">{post.cover && <img className="h-60 w-full rounded-2xl object-cover transition duration-500 group-hover:scale-105" src={mediaSrc(post.cover)} alt={post.title} />}<p className="mt-5 text-xs text-slate-500">{new Date(post.publishedAt).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN')}</p><h3 className="mt-2 text-xl font-bold">{post.title}</h3><p className="mt-2 text-slate-600">{post.excerpt}</p><Link className="mt-4 inline-flex rounded border border-[#ff6422] px-4 py-2 text-[#ff6422]" to={`/posts/${post.slug}`}>{locale === 'hi' ? 'और पढ़ें' : 'Read more'} ↗</Link></article>)}</div><div className="mt-8 flex gap-4"><button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button><span>{page} / {Math.max(1, Math.ceil(data.total / limit))}</span><button disabled={page * limit >= data.total} onClick={() => setPage(p => p + 1)}>Next</button></div></>}</div></section>;
}
export function PostDetail({
  preview = false
}) {
  const {
    slug,
    id
  } = useParams();
  const [post, setPost] = useState(null),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const refresh = () => api(preview ? `/manage/content/${id}` : `/public/posts/${encodeURIComponent(slug)}`).then(d => {
      if (active) {
        setPost(preview ? d.draft : d);
        setError('');
      }
    }).catch(e => {
      if (active) {
        setPost(null);
        setError(e.message);
      }
    });
    refresh();
    const timer = setInterval(refresh, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [slug, id, preview]);
  useEffect(() => {
    if (!post) return;
    const previous = document.title;
    document.title = post.seoTitle || post.title;
    let meta = document.querySelector('meta[name="description"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.append(meta);
    }
    const old = meta.content;
    meta.content = post.seoDescription || post.excerpt;
    return () => {
      document.title = previous;
      if (created) meta.remove();else meta.content = old;
    };
  }, [post]);
  if (error) return <p role="alert" className="page-wrap py-20">{error}</p>;
  if (!post) return <p role="status" className="page-wrap py-20">Loading…</p>;
  return <article className="page-wrap py-16 max-w-4xl" lang={post.locale}>{preview && <p className="mb-6 rounded bg-amber-100 p-3">Protected draft preview · only signed-in staff can view this.</p>}<h1 className="section-title">{post.title}</h1><p className="mb-6 text-slate-500">{post.author} · {post.category}</p>{post.cover && <img className="mb-8 max-h-[520px] w-full rounded-xl object-cover" src={mediaSrc(post.cover)} alt={post.title} />}<p className="mb-6 text-xl">{post.excerpt}</p><div className="cms-body" dangerouslySetInnerHTML={{
      __html: post.body.replaceAll('src="/api/media/', `src="${mediaSrc('/api/media/')}`)
    }} />{post.videoUrl && <iframe className="mt-8 aspect-video w-full" src={post.videoUrl} title={post.title} allowFullScreen />}</article>;
}
