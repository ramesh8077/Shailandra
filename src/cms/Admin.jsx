import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams, useBlocker } from 'react-router-dom';
import { api, mediaSrc } from './api';
import { PostDetail } from './PublicCMS';
import './admin.css';
function Notice({
  error,
  message
}) {
  return <>{error && <p className="notice error" role="alert">{error}</p>}{message && <p className="notice" role="status">{message}</p>}</>;
}
function useLoad(path) {
  const [result, setResult] = useState({}),
    [version, reload] = useState(0);
  useEffect(() => {
    let active = true;
    api(path).then(data => {
      if (active) setResult({
        path,
        version,
        data
      });
    }).catch(e => {
      if (active) setResult({
        path,
        version,
        error: e.message
      });
    });
    return () => {
      active = false;
    };
  }, [path, version]);
  const current = result.path === path && result.version === version ? result : {};
  return {
    data: current.data,
    error: current.error,
    reload: () => reload(v => v + 1)
  };
}
function Loading({
  error
}) {
  return error ? <p role="alert" className="notice error">{error}</p> : <p role="status">Loading…</p>;
}
function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  multiline = false,
  ...rest
}) {
  return <label className="admin-field">{label}{multiline ? <textarea {...rest} rows={4} value={value ?? ''} onChange={e => onChange(e.target.value)} required={required} /> : <input {...rest} type={type} value={value ?? ''} onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} required={required} />}</label>;
}
function Pager({
  data,
  page,
  setPage
}) {
  return <div className="toolbar"><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {Math.max(1, Math.ceil(data.total / data.limit))} · {data.total} items</span><button disabled={page * data.limit >= data.total} onClick={() => setPage(page + 1)}>Next</button></div>;
}
function useUnsaved(dirty) {
  const skip = useRef(false);
  const blocker = useBlocker(() => dirty && !skip.current);
  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (window.confirm('Discard unsaved changes?')) blocker.proceed();else blocker.reset();
    }
  }, [blocker]);
  useEffect(() => {
    if (!dirty) return;
    const unload = e => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', unload);
    return () => window.removeEventListener('beforeunload', unload);
  }, [dirty]);
  return skip;
}
export default function Admin() {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('');
  useEffect(() => {
    api('/auth/me').then(d => setUser(d.user)).catch(e => {
      if (e.status !== 401) setError(e.message);
    }).finally(() => setLoading(false));
  }, []);
  if (loading) return <main className="admin"><Loading /></main>;
  if (!user) return <Login onLogin={setUser} initialError={error} />;
  return <div className="admin"><aside><Link className="brand" to="/admin">SHALINDER <small>Content studio</small></Link><nav aria-label="Administration">{[['', 'Overview'], ['content/post', 'Posts'], ['content/page', 'Pages & homepage'], ['content/journey', 'Journey'], ['content/settings', 'Website settings'], ['media', 'Media library'], ...(user.role === 'administrator' ? [['users', 'Staff users']] : [])].map(([path, label]) => <NavLink end key={path} to={`/admin/${path}`}>{label}</NavLink>)}</nav><p>{user.name}<br /><small>{user.role}</small></p><a href="/" target="_blank" rel="noreferrer">View website ↗</a><button onClick={async () => {
        try {
          await api('/auth/logout', {
            method: 'POST'
          });
          setUser(null);
        } catch (e) {
          setError(e.message);
        }
      }}>Sign out</button></aside><main><Notice error={error} /><Routes><Route index element={<Dashboard />} /><Route path="login" element={<Dashboard />} /><Route path="content/:kind" element={<ContentList />} /><Route path="edit/:id" element={<Editor user={user} />} /><Route path="new/:kind" element={<Editor user={user} />} /><Route path="preview/:id" element={<PostDetail preview />} /><Route path="media" element={<MediaLibrary user={user} />} /><Route path="users" element={user.role === 'administrator' ? <Users /> : <p>Administrator permission required.</p>} /><Route path="*" element={<p>Page not found.</p>} /></Routes></main></div>;
}
function Login({
  onLogin,
  initialError
}) {
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [error, setError] = useState(initialError),
    [busy, setBusy] = useState(false);
  return <div className="admin login"><form onSubmit={async e => {
      e.preventDefault();
      setBusy(true);
      setError('');
      try {
        const d = await api('/auth/login', {
          method: 'POST',
          body: {
            email,
            password
          }
        });
        onLogin(d.user);
      } catch (e) {
        setError(e.message);
      } finally {
        setBusy(false);
      }
    }}><p className="eyebrow">SHALINDER · CONTENT STUDIO</p><h1>Welcome back</h1><p>Sign in to manage the website.</p><Notice error={error} /><Field label="Email / ईमेल" type="email" value={email} onChange={setEmail} required autoComplete="username" /><Field label="Password / पासवर्ड" type="password" value={password} onChange={setPassword} required autoComplete="current-password" /><button className="primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button><p className="muted">Need access or a password reset? Contact your website administrator.</p></form></div>;
}
function Dashboard() {
  const {
    data,
    error
  } = useLoad('/manage/dashboard');
  if (!data) return <Loading error={error} />;
  return <><p className="eyebrow">YOUR WEBSITE, YOUR VOICE</p><h1>Overview</h1><p>Prepare content, review it, then publish when it is ready.</p><div className="metrics">{['posts', 'published', 'drafts', 'media'].map(k => <div key={k}><strong>{data[k]}</strong><span>{k}</span></div>)}</div><div className="panel"><h2>Publishing permissions</h2><p>Editors save drafts, preview content and upload media. Administrators also publish, unpublish, trash, restore, delete unused media and manage staff.</p><Link className="button primary" to="/admin/new/post">Create a post</Link></div><h2>Recent activity</h2><ul className="activity">{data.activity.map(a => <li key={a._id}><strong>{a.action}</strong><small>{new Date(a.createdAt).toLocaleString()} · {a.target}</small></li>)}</ul></>;
}
function ContentList() {
  const {
    kind
  } = useParams();
  return <ContentListInner key={kind} kind={kind} />;
}
function ContentListInner({
  kind
}) {
  const [q, setQ] = useState(''),
    [status, setStatus] = useState('all'),
    [page, setPage] = useState(1);
  const {
    data,
    error
  } = useLoad(`/manage/content?${new URLSearchParams({
    kind,
    q,
    status,
    page
  })}`);
  return <><div className="heading"><div><p className="eyebrow">CONTENT LIBRARY</p><h1>{{
            post: 'Posts',
            page: 'Pages & homepage',
            journey: 'Journey',
            settings: 'Website settings'
          }[kind]}</h1></div>{['post', 'journey'].includes(kind) && <Link className="button primary" to={`/admin/new/${kind}`}>Create {kind}</Link>}</div><div className="toolbar"><Field label="Search" value={q} onChange={v => {
        setQ(v);
        setPage(1);
      }} /><label className="admin-field">Status<select value={status} onChange={e => {
          setStatus(e.target.value);
          setPage(1);
        }}>{['all', 'draft', 'published', 'trash'].map(s => <option key={s}>{s}</option>)}</select></label></div>{!data ? <Loading error={error} /> : <><div className="list">{data.items.map(item => <Link key={item._id} to={`/admin/edit/${item._id}`}><strong>{item.draft.title || sectionLabel(item.key)}</strong><span className="badge">{item.trashed ? 'Trash' : item.published ? 'Published · draft editable' : 'Draft'}</span><small>{new Date(item.updatedAt).toLocaleString()}</small></Link>)}{!data.items.length && <p>No items found. Page sections are created by the explicit seed command.</p>}</div><Pager data={data} page={page} setPage={setPage} /></>}</>;
}
const blankPost = {
  type: 'article',
  title: '',
  slug: '',
  locale: 'en',
  excerpt: '',
  body: '',
  cover: '',
  category: '',
  tags: [],
  author: '',
  seoTitle: '',
  seoDescription: '',
  videoUrl: '',
  sourceUrl: ''
};
const blankJourney = {
  year: '',
  title: '',
  text: '',
  order: 0,
  locale: 'en'
};
function Editor({
  user
}) {
  const {
    id,
    kind
  } = useParams();
  const {
    data,
    error
  } = useLoad(id ? `/manage/content/${id}` : '/manage/schema');
  if (!data) return <Loading error={error} />;
  return <EditorForm key={id || kind} initial={id ? data : {
    kind,
    draft: kind === 'post' ? {
      ...blankPost,
      author: user.name
    } : blankJourney
  }} user={user} />;
}
function EditorForm({
  initial,
  user
}) {
  const navigate = useNavigate();
  const [doc, setDoc] = useState(initial),
    [draft, setDraft] = useState(initial.draft),
    [saved, setSaved] = useState(JSON.stringify(initial.draft)),
    [locale, setLocale] = useState('en'),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [picker, setPicker] = useState(null);
  const schema = useLoad('/manage/schema');
  const dirty = JSON.stringify(draft) !== saved;
  const skipWarning = useUnsaved(dirty);
  const change = (key, value) => setDraft(d => ({
    ...d,
    [key]: value
  }));
  async function save() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const updated = await api(doc._id ? `/manage/content/${doc._id}` : '/manage/content', {
        method: doc._id ? 'PUT' : 'POST',
        body: doc._id ? {
          draft,
          revision: doc.revision
        } : {
          kind: doc.kind,
          draft
        }
      });
      setDoc(updated);
      setDraft(updated.draft);
      setSaved(JSON.stringify(updated.draft));
      setMessage('Draft saved. The public version has not changed.');
      if (!doc._id) {
        skipWarning.current = true;
        navigate(`/admin/edit/${updated._id}`, {
          replace: true
        });
      }
      return updated;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setBusy(false);
    }
  }
  async function action(action) {
    if (!window.confirm(`${action[0].toUpperCase() + action.slice(1)} this content? ${action === 'publish' ? 'The saved draft becomes public.' : ''}`)) return;
    setBusy(true);
    setError('');
    try {
      const updated = await api(`/manage/content/${doc._id}/${action}`, {
        method: 'POST',
        body: {
          revision: doc.revision
        }
      });
      setDoc(updated);
      setMessage(`Content ${action} completed.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const field = (name, label, multiline = false) => <Field key={name} label={label} value={draft[name]} onChange={v => change(name, v)} multiline={multiline} />;
  return <><p className="eyebrow">{doc.kind} · {doc.published ? 'PUBLISHED SNAPSHOT + WORKING DRAFT' : 'DRAFT'}{dirty ? ' · UNSAVED' : ''}</p><h1>{draft.title || sectionLabel(doc.key) || 'Create content'}</h1><Notice error={error} message={message} /><form onSubmit={e => {
      e.preventDefault();
      save();
    }}><fieldset disabled={busy || doc.trashed}><div className="panel">{doc.kind === 'post' ? <><div className="form-grid">{field('title', 'Title / शीर्षक')}{field('slug', 'Unique URL slug')}<label className="admin-field">Type<select value={draft.type} onChange={e => change('type', e.target.value)}>{['article', 'news', 'video'].map(x => <option key={x}>{x}</option>)}</select></label><Locale value={draft.locale} onChange={v => change('locale', v)} />{field('category', 'Category')}{field('author', 'Public author name')}</div>{field('excerpt', 'Excerpt / सारांश', true)}<MediaField label="Cover image" value={draft.cover} onChoose={() => setPicker({
              select: url => change('cover', url)
            })} onClear={() => change('cover', '')} /><RichEditor value={draft.body} onChange={v => change('body', v)} onImage={insert => setPicker({
              select: insert
            })} /><Field label="Original coverage URL (HTTPS)" value={draft.sourceUrl} onChange={value => change('sourceUrl', value)} /><p className="muted">For Media Centre, choose News and category “Digital Spotlight” with this source URL, or “Print Spotlight” with a clipping cover image.</p><Field label="Tags (comma-separated)" value={draft.tags.join(', ')} onChange={v => change('tags', v.split(',').map(t => t.trim()))} />{field('videoUrl', 'Video embed URL (YouTube privacy-enhanced or Vimeo)')}<p className="muted">https://www.youtube-nocookie.com/embed/VIDEO_ID or https://player.vimeo.com/video/ID</p><h2>Search engines</h2>{field('seoTitle', 'SEO title')}{field('seoDescription', 'SEO description', true)}</> : doc.kind === 'journey' ? <><div className="form-grid">{field('year', 'Year / period')}{field('title', 'Title')}<Field label="Display order" type="number" value={draft.order} onChange={v => change('order', v)} min={0} /><Locale value={locale} onChange={setLocale} /></div>{field('text', 'Story', true)}</> : <><Locale value={locale} onChange={setLocale} /><p className="muted">English and Hindi have separate fields. Image replacement affects this field only after publication.</p>{schema.data ? Object.entries(schema.data.sections[doc.key].fields).map(([key, definition]) => definition.type === 'image' ? <MediaField key={key} label={definition.label} value={draft[locale][key]} onChoose={() => setPicker({
              select: url => setDraft(d => ({
                ...d,
                [locale]: {
                  ...d[locale],
                  [key]: url
                }
              }))
            })} /> : <Field key={key} label={definition.label} value={draft[locale][key]} multiline={definition.type === 'text' && draft[locale][key].length > 100} onChange={value => setDraft(d => ({
              ...d,
              [locale]: {
                ...d[locale],
                [key]: value
              }
            }))} />) : <Loading error={schema.error} />}</>}</div></fieldset><div className="editor-actions"><button className="primary" disabled={busy || doc.trashed}>{busy ? 'Working…' : 'Save draft / ड्राफ्ट सहेजें'}</button>{doc._id && <a className="button" target="_blank" rel="noreferrer" href={doc.kind === 'post' ? `/admin/preview/${doc._id}` : `${sectionRoute(doc.key,doc.kind)}?preview=draft`}>Preview saved draft ↗</a>}{doc._id && user.role === 'administrator' && (doc.trashed ? <button type="button" disabled={busy} onClick={() => action('restore')}>Restore</button> : <>{['publish', 'unpublish', 'trash'].map(a => <button key={a} type="button" disabled={busy || dirty || a === 'unpublish' && !doc.published} onClick={() => action(a)}>{a}</button>)}</>)}</div>{dirty && <p className="muted">Save before previewing or publishing. Your entered values are retained if a request fails.</p>}</form>{picker && <MediaPicker onSelect={url => {
      picker.select(url);
      setPicker(null);
    }} onClose={() => setPicker(null)} />}</>;
}
function sectionRoute(key,kind) {
  if(kind==='journey')return '/journey';
  return {
    JourneyPage: '/journey',
    EducationPage: '/education',
    Sewapage: '/sewa',
    Sportspage: '/sports',
    vision2047: '/vision-2047',
    Thoughtleadershippage: '/thought-leadership',
    Updevelopmentpage: '/updevelopment',
    ChaiPaiCharchaPage: '/coffe-pai-charcha',
    ConnectPage: '/connect',
    Nationbuildingpage: '/nation-building',
    Mediapage: '/media'
  }[key] || '/';
}
function Locale({
  value,
  onChange
}) {
  return <label className="admin-field">Content language / भाषा<select value={value} onChange={e => onChange(e.target.value)}><option value="en">English</option><option value="hi">हिन्दी</option></select></label>;
}
function MediaField({
  label,
  value,
  onChoose,
  onClear
}) {
  return <div className="admin-field"><span>{label}</span>{value && <img className="selected-media" src={mediaSrc(value)} alt="Selected image" />}<div className="toolbar"><button type="button" onClick={onChoose}>{value ? 'Replace image' : 'Choose image'}</button>{value && onClear && <button type="button" onClick={onClear}>Remove</button>}</div></div>;
}
function RichEditor({
  value,
  onChange,
  onImage
}) {
  const ref = useRef(null),
    range = useRef(null);
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value && document.activeElement !== ref.current) ref.current.innerHTML = value;
  }, [value]);
  function remember() {
    const selection = window.getSelection();
    if (selection.rangeCount && ref.current.contains(selection.anchorNode)) range.current = selection.getRangeAt(0).cloneRange();
  }
  function restore() {
    ref.current.focus();
    if (range.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range.current);
    }
  }
  function command(cmd, arg) {
    restore();
    document.execCommand(cmd, false, arg);
    onChange(ref.current.innerHTML);
    remember();
  }
  return <div className="admin-field"><span>Body / लेख</span><div className="rich-toolbar" role="toolbar" aria-label="Text formatting">{[['bold', 'Bold'], ['italic', 'Italic'], ['insertUnorderedList', 'Bullets'], ['insertOrderedList', 'Numbered'], ['formatBlock', 'Heading', 'h2'], ['formatBlock', 'Paragraph', 'p'], ['undo', 'Undo'], ['redo', 'Redo']].map(([cmd, label, arg]) => <button type="button" key={label} onMouseDown={e => e.preventDefault()} onClick={() => command(cmd, arg)}>{label}</button>)}<button type="button" onMouseDown={e => e.preventDefault()} onClick={() => {
        const url = window.prompt('HTTPS link URL');
        if (url && /^https:\/\//.test(url)) command('createLink', url);
      }}>Link</button><button type="button" onClick={() => {
        remember();
        onImage(url => command('insertImage', url));
      }}>Inline image</button></div><div ref={ref} className="rich-editor cms-body" role="textbox" aria-label="Post body" aria-multiline="true" contentEditable suppressContentEditableWarning onInput={() => onChange(ref.current.innerHTML)} onKeyUp={remember} onMouseUp={remember} onPaste={e => {
      e.preventDefault();
      command('insertText', e.clipboardData.getData('text/plain'));
    }} onDrop={e => e.preventDefault()} /><small>Paste inserts plain text. Formatting and images are sanitized on save.</small></div>;
}
function MediaPicker({
  onSelect,
  onClose
}) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.showModal();
  }, []);
  return <dialog ref={ref} className="admin media-dialog" aria-label="Choose an image" onCancel={onClose}><div className="heading"><h2>Choose an image</h2><button type="button" onClick={onClose}>Close</button></div><MediaLibrary onSelect={url=>{ref.current.close();onSelect(url);}} /></dialog>;
}
function MediaLibrary({
  user,
  onSelect
}) {
  const [q, setQ] = useState(''),
    [page, setPage] = useState(1),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [file, setFile] = useState(null),
    [alt, setAlt] = useState('');
  const inputRef = useRef(null);
  const {
    data,
    error: loadError,
    reload
  } = useLoad(`/manage/media?${new URLSearchParams({
    q,
    page,
    limit: 12
  })}`);
  async function upload(e) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('alt', alt);
      const item = await api('/manage/media', {
        method: 'POST',
        body
      });
      setMessage('Uploaded privately. Select this image in content and publish to make it public.');
      setFile(null);
      setAlt('');
      inputRef.current.value = '';
      reload();
      if (onSelect) onSelect(item.url);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return <><h1>Media library</h1><p>JPEG, PNG or WebP · up to 10 MB. Upload a new version, then select it in the desired content field. Existing uses keep the original. Recommended sizes: hero banners 1920 × 760 px (2.5:1); cards and article covers 1200 × 900 px (4:3); video thumbnails 1280 × 720 px (16:9); square photos 800 × 800 px; transparent logos up to 600 × 300 px. Banners and cards crop to fill their frames, so keep important subjects near the center. The library shows each image’s current dimensions.</p><Notice error={error || loadError} message={message} /><form className="panel" onSubmit={upload}><label className="admin-field">Image<input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" required onChange={e => setFile(e.target.files[0])} /></label><Field label="Image description" value={alt} onChange={setAlt} /><button className="primary" disabled={busy}>{busy ? 'Uploading…' : 'Upload image'}</button></form><Field label="Search filenames" value={q} onChange={v => {
      setQ(v);
      setPage(1);
    }} />{data && <><div className="media-grid">{data.items.map(m => <div className="panel" key={m._id}><img src={mediaSrc(m.url)} alt={m.alt} /><strong>{m.originalName}</strong><small>{m.width} × {m.height} · {Math.round(m.size / 1024)} KB</small><p>{m.usage.length} content reference(s)</p>{m.usage.length > 0 && <details><summary>Where used</summary><ul>{m.usage.map(u => <li key={u.id}><Link to={`/admin/edit/${u.id}`}>{sectionLabel(u.key)}</Link></li>)}</ul></details>}<div className="toolbar">{onSelect ? <button type="button" onClick={() => onSelect(m.url)}>Select image</button> : <button type="button" onClick={async () => {
              const value = window.prompt('Image description', m.alt);
              if (value === null) return;
              try {
                await api(`/manage/media/${m._id}`, {
                  method: 'PATCH',
                  body: {
                    alt: value
                  }
                });
                reload();
              } catch (e) {
                setError(e.message);
              }
            }}>Edit description</button>}{user?.role === 'administrator' && <button disabled={!!m.usage.length} onClick={async () => {
              if (!window.confirm('Permanently delete this unused image?')) return;
              try {
                await api(`/manage/media/${m._id}`, {
                  method: 'DELETE'
                });
                reload();
              } catch (e) {
                setError(e.message);
              }
            }}>Delete</button>}</div></div>)}</div>{!data.items.length && <p>No images found.</p>}<Pager data={data} page={page} setPage={setPage} /></>}</>;
}
function Users() {
  const [page, setPage] = useState(1),
    [q, setQ] = useState(''),
    [form, setForm] = useState({
      email: '',
      name: '',
      password: '',
      role: 'editor'
    }),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  const {
    data,
    error: loadError,
    reload
  } = useLoad(`/manage/users?${new URLSearchParams({
    page,
    q
  })}`);
  async function update(id, body) {
    try {
      await api(`/manage/users/${id}`, {
        method: 'PATCH',
        body
      });
      reload();
    } catch (e) {
      setError(e.message);
    }
  }
  return <><h1>Staff users</h1><Notice error={error || loadError} message={message} /><form className="panel" onSubmit={async e => {
      e.preventDefault();
      setBusy(true);
      try {
        await api('/manage/users', {
          method: 'POST',
          body: form
        });
        setForm({
          email: '',
          name: '',
          password: '',
          role: 'editor'
        });
        setMessage('Staff account created. Share credentials securely.');
        reload();
      } catch (e) {
        setError(e.message);
      } finally {
        setBusy(false);
      }
    }}><h2>Create account</h2><div className="form-grid">{['name', 'email', 'password'].map(k => <Field key={k} label={k === 'password' ? 'Initial password (12+ characters)' : k} type={k === 'name' ? 'text' : k} value={form[k]} required minLength={k === 'password' ? 12 : undefined} onChange={v => setForm(f => ({
          ...f,
          [k]: v
        }))} />)}<label className="admin-field">Role<select value={form.role} onChange={e => setForm(f => ({
            ...f,
            role: e.target.value
          }))}><option>editor</option><option>administrator</option></select></label></div><button className="primary" disabled={busy}>Create staff user</button></form><Field label="Search email" value={q} onChange={v => {
      setQ(v);
      setPage(1);
    }} />{data && <><div className="list">{data.items.map(u => <div key={u._id}><strong>{u.name} · {u.email}</strong><span>{u.role} · {u.disabled ? 'Disabled' : 'Active'}</span><button onClick={() => {
            if (window.confirm('Change account access? Existing sessions will be revoked.')) update(u._id, {
              disabled: !u.disabled
            });
          }}>{u.disabled ? 'Enable' : 'Disable'}</button><button onClick={() => {
            if (window.confirm('Change this staff role and revoke existing sessions?')) update(u._id, {
              role: u.role === 'editor' ? 'administrator' : 'editor'
            });
          }}>Make {u.role === 'editor' ? 'administrator' : 'editor'}</button></div>)}</div><Pager data={data} page={page} setPage={setPage} /></>}</>;
}

function sectionLabel(key){return {"Hero":"Home · Hero","Journey":"Home · Introduction cards","Stats":"Home · Statistics","Features":"Home · Features","YouthConnect":"Home · Youth questions","ContactInsights":"Home · Contact and videos","Navbar":"Navigation","Footer":"Footer","JourneyPage":"Journey · Page content","EducationPage":"Education","Sewapage":"Sewa","Sportspage":"Sports","vision2047":"Vision 2047","Thoughtleadershippage":"Thought leadership","Updevelopmentpage":"UP development","ChaiPaiCharchaPage":"Chai Pe Charcha","ConnectPage":"Connect","Nationbuildingpage":"Nation building","Mediapage":"Media"}[key] || key;}
