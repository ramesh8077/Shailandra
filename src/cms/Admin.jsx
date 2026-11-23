import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams, useBlocker } from 'react-router-dom';
import { api, mediaSrc } from './api';
import { PostDetail } from './PublicCMS';
import { ContentContext } from './contentContext';
import './admin.css';

// Public Section and Page Component imports for in-place Live Preview
import Hero from '../components/Hero';
import Journey from '../components/Journey';
import Stats from '../components/Stats';
import Features from '../components/Features';
import YouthConnect from '../components/YouthConnect';
import ContactInsights from '../components/ContactInsights';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

import EducationPage from '../pages/EducationPage';
import JourneyPage from '../pages/JourneyPage';
import Sewapage from '../pages/Sewapage';
import Sportspage from '../pages/Sportspage';
import Vision2047Page from '../pages/vision2047';
import ThoughtLeadershipPage from '../pages/Thoughtleadershippage';
import UpDevelopmentPage from '../pages/Updevelopmentpage';
import ChaiPaiCharchaPage from '../pages/ChaiPaiCharchaPage';
import ConnectPage from '../pages/ConnectPage';
import NationBuildingPage from '../pages/Nationbuildingpage';
import MediaPage from '../pages/Mediapage';

function Notice({ error, message }) {
  return <>{error && <div className="notice error" role="alert">{error}</div>}{message && <div className="notice" role="status">{message}</div>}</>;
}

function useLoad(path) {
  const [result, setResult] = useState({}),
    [version, reload] = useState(0);
  useEffect(() => {
    let active = true;
    api(path).then(data => {
      if (active) setResult({ path, version, data });
    }).catch(e => {
      if (active) setResult({ path, version, error: e.message });
    });
    return () => { active = false; };
  }, [path, version]);
  const current = result.path === path && result.version === version ? result : {};
  return { data: current.data, error: current.error, reload: () => reload(v => v + 1) };
}

function Loading({ error }) {
  return error ? <div role="alert" className="notice error">{error}</div> : <p role="status" style={{ color: '#64748b', padding: '20px 0' }}>Loading data…</p>;
}

function Field({ label, value, onChange, type = 'text', required = false, multiline = false, hint, ...rest }) {
  return (
    <label className="admin-field">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{label}</span>
        {hint && <small style={{ color: '#64748b', fontWeight: 400 }}>{hint}</small>}
      </div>
      {multiline
        ? <textarea {...rest} rows={4} value={value ?? ''} onChange={e => onChange(e.target.value)} required={required} />
        : <input {...rest} type={type} value={value ?? ''} onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} required={required} />
      }
    </label>
  );
}

function Pager({ data, page, setPage }) {
  if (!data || data.total <= data.limit) return null;
  return <div className="toolbar" style={{ justifyContent: 'center', marginTop: '20px' }}>
    <button disabled={page === 1} onClick={() => setPage(page - 1)}>← Previous</button>
    <span style={{ fontSize: '13px', color: '#64748b' }}>Page {page} of {Math.max(1, Math.ceil(data.total / data.limit))} · ({data.total} items)</span>
    <button disabled={page * data.limit >= data.total} onClick={() => setPage(page + 1)}>Next →</button>
  </div>;
}

function useUnsaved(dirty) {
  const skip = useRef(false);
  const blocker = useBlocker(() => dirty && !skip.current);
  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (window.confirm('Discard unsaved changes?')) blocker.proceed(); else blocker.reset();
    }
  }, [blocker]);
  useEffect(() => {
    if (!dirty) return;
    const unload = e => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', unload);
    return () => window.removeEventListener('beforeunload', unload);
  }, [dirty]);
  return skip;
}

class PreviewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.warn('Live preview rendering error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px 20px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a', color: '#92400e', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 8px', fontSize: '16px' }}>Live Preview Notice</h4>
          <p style={{ fontSize: '13px', margin: 0 }}>Updating preview with your content: {this.state.error?.message || 'Rendering'}</p>
          <button type="button" className="button" style={{ marginTop: '12px' }} onClick={() => this.setState({ hasError: false })}>
            🔄 Refresh Preview
          </button>
        </div>
      );
    }
    return this.props.children;
  }
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

  if (loading) return <main className="admin" style={{ display: 'grid', placeItems: 'center' }}><Loading /></main>;
  if (!user) return <Login onLogin={setUser} initialError={error} />;

  return <div className="admin">
    <aside>
      <Link className="brand" to="/admin">
        SHAILENDRA
        <small>Admin & Content Studio</small>
      </Link>

      <Link className="quick-create" to="/admin/new/post">
        <span>+</span> Create New Post
      </Link>

      <nav aria-label="Administration">
        {[
          ['', '📊 Overview'],
          ['content/post', '📝 Posts & Blogs'],
          ['content/page', '📄 Pages & Content'],
          ['contacts', '📬 Contact Messages'],
          ['content/journey', '🚀 Journey Milestones'],
          ['media', '🖼️ Media Library'],
          ...(user.role === 'administrator' ? [['users', '👥 Staff Users']] : [])
        ].map(([path, label]) => <NavLink end key={path} to={`/admin/${path}`}>{label}</NavLink>)}
      </nav>

      <div className="user-info">
        <strong>{user.name}</strong>
        <small>{user.role}</small>
      </div>

      <a className="view-site-link" href="/" target="_blank" rel="noreferrer">
        View Live Website ↗
      </a>

      <button className="signout-btn" onClick={async () => {
        try { await api('/auth/logout', { method: 'POST' }); setUser(null); }
        catch (e) { setError(e.message); }
      }}>Sign out</button>
    </aside>

    <main>
      <Notice error={error} />
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="login" element={<Dashboard />} />
        <Route path="content/:kind" element={<ContentList />} />
        <Route path="edit/:id" element={<Editor user={user} />} />
        <Route path="new/:kind" element={<Editor user={user} />} />
        <Route path="preview/:id" element={<PostDetail preview />} />
        <Route path="media" element={<MediaLibrary user={user} />} />
        <Route path="contacts" element={<ContactSubmissions user={user} />} />
        <Route path="users" element={user.role === 'administrator' ? <Users /> : <p>Administrator permission required.</p>} />
        <Route path="*" element={<p>Page not found.</p>} />
      </Routes>
    </main>
  </div>;
}

function Login({ onLogin, initialError }) {
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [error, setError] = useState(initialError),
    [busy, setBusy] = useState(false);
  return <div className="admin login">
    <form onSubmit={async e => {
      e.preventDefault();
      setBusy(true); setError('');
      try {
        const d = await api('/auth/login', { method: 'POST', body: { email, password } });
        onLogin(d.user);
      } catch (e) { setError(e.message); }
      finally { setBusy(false); }
    }}>
      <p className="eyebrow">SHAILENDRA BHADAURIA</p>
      <h1>Admin Sign In</h1>
      <p className="subtext">Enter your credentials to manage blogs, contacts, and pages.</p>
      <Notice error={error} />
      <Field label="Email Address / ईमेल" type="email" value={email} onChange={setEmail} required autoComplete="username" placeholder="admin@shalinder.com" />
      <Field label="Password / पासवर्ड" type="password" value={password} onChange={setPassword} required autoComplete="current-password" placeholder="••••••••••••" />
      <button className="primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in to Dashboard'}</button>
      <div style={{ marginTop: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#64748b' }}>
        <strong>Default Admin:</strong> admin@shalinder.com<br />
        <strong>Password:</strong> Admin@12345678
      </div>
    </form>
  </div>;
}

function Dashboard() {
  const { data, error } = useLoad('/manage/dashboard');
  if (!data) return <Loading error={error} />;
  return <>
    <p className="eyebrow">CONTROL CENTER</p>
    <h1>Overview & Statistics</h1>
    <p className="subtext">Manage website blogs, view public inquiries, and update site content in real time.</p>

    <div className="metrics">
      <div><strong>{data.posts}</strong><span>Total Posts / Blogs</span></div>
      <div><strong>{data.published}</strong><span>Live Published</span></div>
      <div><strong>{data.drafts}</strong><span>Draft Posts</span></div>
      <div><strong>{data.media}</strong><span>Media Files</span></div>
      <div><strong>{data.contacts || 0}</strong><span>Contact Inquiries</span></div>
    </div>

    <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
      <div>
        <h2 style={{ margin: '0 0 6px' }}>Quick Actions</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Edit pages with live real-time preview, write blogs, or review contact inquiries.</p>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Link className="button primary" to="/admin/content/page">📄 Edit Website Pages</Link>
        <Link className="button" to="/admin/new/post">✍️ Create New Post</Link>
        <Link className="button" to="/admin/contacts">📬 Contact Inquiries</Link>
      </div>
    </div>

    <h2>Recent Activity Stream</h2>
    {data.activity && data.activity.length > 0 ? (
      <ul className="activity">
        {data.activity.map(a => (
          <li key={a._id}>
            <div>
              <strong style={{ textTransform: 'capitalize' }}>{a.action}</strong>
              <span style={{ color: '#64748b', fontSize: '13px', marginLeft: '10px' }}>Target ID: {a.target}</span>
            </div>
            <small style={{ color: '#94a3b8' }}>{new Date(a.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    ) : (
      <div className="panel" style={{ textAlign: 'center', color: '#64748b' }}>No recent activity logged yet.</div>
    )}
  </>;
}

// ─── Contact Submissions Tracker ───────────────────────────────
function ContactSubmissions({ user }) {
  const [q, setQ] = useState(''), [status, setStatus] = useState('all'), [page, setPage] = useState(1);
  const [error, setError] = useState(''), [message, setMessage] = useState('');
  const { data, error: loadError, reload } = useLoad(`/manage/contacts?${new URLSearchParams({ q, status, page, limit: 20 })}`);

  async function updateContact(id, body) {
    try {
      await api(`/manage/contacts/${id}`, { method: 'PATCH', body });
      setMessage('Contact status updated successfully.');
      reload();
    } catch (e) { setError(e.message); }
  }

  async function deleteContact(id) {
    if (!window.confirm('Are you sure you want to delete this contact submission?')) return;
    try {
      await api(`/manage/contacts/${id}`, { method: 'DELETE' });
      setMessage('Contact submission deleted.');
      reload();
    } catch (e) { setError(e.message); }
  }

  function exportCSV() {
    if (!data?.items?.length) return;
    const headers = ['Name', 'Age Group', 'Location', 'Interest', 'Message', 'Status', 'Date'];
    const rows = data.items.map(c => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.ageGroup || ''}"`,
      `"${(c.location || '').replace(/"/g, '""')}"`,
      `"${c.interest || ''}"`,
      `"${(c.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${c.status || ''}"`,
      `"${new Date(c.createdAt).toLocaleDateString()}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `contact_submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const statusBadgeStyle = (status) => {
    switch (status) {
      case 'new': return { background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' };
      case 'read': return { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' };
      case 'replied': return { background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' };
      default: return { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };
    }
  };

  return <>
    <div className="heading">
      <div>
        <p className="eyebrow">INQUIRIES & LEADS</p>
        <h1>Contact Submissions</h1>
        <p className="subtext">View and manage messages sent from the Contact Us form on the website.</p>
      </div>
      {data?.items?.length > 0 && (
        <button type="button" onClick={exportCSV} className="button">
          📥 Download CSV Export
        </button>
      )}
    </div>

    <Notice error={error || loadError} message={message} />

    <div className="toolbar" style={{ background: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
      <div style={{ flex: 1, minWidth: '240px' }}>
        <input
          type="text"
          placeholder="🔍 Search by name, location, or message text..."
          value={q}
          onChange={v => { setQ(v.target.value); setPage(1); }}
        />
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
        Status:
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="all">All Inquiries</option>
          <option value="new">🔵 New (Unread)</option>
          <option value="read">🟡 Read</option>
          <option value="replied">🟢 Replied</option>
          <option value="archived">⚪ Archived</option>
        </select>
      </label>
    </div>

    {!data ? <Loading error={loadError} /> : <>
      {data.items.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
          <h2 style={{ margin: '0 0 6px' }}>No contact submissions found</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>When visitors submit the contact form on your website, their messages will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px', marginTop: '20px' }}>
          {data.items.map(contact => (
            <div key={contact._id} className="panel" style={{
              margin: 0,
              borderLeft: contact.status === 'new' ? '5px solid #3b82f6' : '1px solid var(--admin-border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <strong style={{ fontSize: '17px', color: '#0f172a' }}>{contact.name}</strong>
                  <span style={{
                    marginLeft: '12px',
                    padding: '3px 12px',
                    borderRadius: '99px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    ...statusBadgeStyle(contact.status)
                  }}>
                    {contact.status}
                  </span>
                </div>
                <small style={{ color: '#64748b' }}>
                  📅 {new Date(contact.createdAt).toLocaleDateString()} at {new Date(contact.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', margin: '14px 0', fontSize: '14px' }}>
                <div><span style={{ color: '#64748b' }}>Age Group:</span> <strong>{contact.ageGroup || 'N/A'}</strong></div>
                <div><span style={{ color: '#64748b' }}>Location:</span> <strong>{contact.location || 'N/A'}</strong></div>
                <div><span style={{ color: '#64748b' }}>Area of Interest:</span> <strong style={{ textTransform: 'capitalize' }}>{contact.interest || 'General'}</strong></div>
              </div>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px 16px',
                margin: '10px 0',
                fontSize: '14px',
                lineHeight: '1.7',
                color: '#1e293b'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Message:</div>
                {contact.message}
              </div>

              {contact.notes && (
                <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '10px 14px', margin: '10px 0', fontSize: '13px' }}>
                  <strong>Admin Note:</strong> {contact.notes}
                </div>
              )}

              <div className="toolbar" style={{ marginTop: '14px', gap: '8px' }}>
                {contact.status === 'new' && (
                  <button className="button" onClick={() => updateContact(contact._id, { status: 'read' })}>
                    Mark as Read
                  </button>
                )}
                {contact.status !== 'replied' && (
                  <button className="button" onClick={() => updateContact(contact._id, { status: 'replied' })}>
                    Mark as Replied
                  </button>
                )}
                {contact.status !== 'archived' && (
                  <button className="button" onClick={() => updateContact(contact._id, { status: 'archived' })}>
                    Archive
                  </button>
                )}
                <button className="button" onClick={() => {
                  const note = window.prompt('Add private admin note:', contact.notes || '');
                  if (note !== null) updateContact(contact._id, { notes: note });
                }}>
                  ✏️ {contact.notes ? 'Edit Note' : 'Add Note'}
                </button>
                {user?.role === 'administrator' && (
                  <button className="button" style={{ color: '#dc2626', marginLeft: 'auto' }} onClick={() => deleteContact(contact._id)}>
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pager data={data} page={page} setPage={setPage} />
    </>}
  </>;
}

// ─── Content List with Organized Directory ──────────────────────────
function ContentList() {
  const { kind } = useParams();
  return <ContentListInner key={kind} kind={kind} />;
}

function ContentListInner({ kind }) {
  const [q, setQ] = useState(''), [status, setStatus] = useState('all'), [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('all'); // for page kind: 'all' | 'home' | 'pages' | 'global'
  const { data, error } = useLoad(`/manage/content?${new URLSearchParams({ kind, q, status, page })}`);

  const titles = {
    post: 'Posts & Blogs / ब्लॉग एवं लेख',
    page: 'Pages & Website Sections / वेबसाइट पेज सामग्री',
    journey: 'Journey Milestones / मेरी यात्रा पड़ाव',
    settings: 'Website Settings / सेटिंग्स'
  };

  const getSectionCategory = (key) => {
    if (['Hero', 'Journey', 'Stats', 'Features', 'YouthConnect', 'ContactInsights'].includes(key)) return 'home';
    if (['Navbar', 'Footer'].includes(key)) return 'global';
    return 'pages';
  };

  const filteredItems = (data?.items || []).filter(item => {
    if (kind !== 'page' || activeCategory === 'all') return true;
    return getSectionCategory(item.key) === activeCategory;
  });

  return <>
    <div className="heading">
      <div>
        <p className="eyebrow">CONTENT MANAGER</p>
        <h1>{titles[kind] || kind}</h1>
        <p className="subtext">
          {kind === 'post' && 'Write, edit, and publish blogs, articles, and video features.'}
          {kind === 'page' && 'Click any section to edit text, images, and headings with Real-Time Live Preview!'}
          {kind === 'journey' && 'Update milestone stories and timeline periods for the Journey page.'}
        </p>
      </div>
      {['post', 'journey'].includes(kind) && (
        <Link className="button primary" to={`/admin/new/${kind}`}>
          + Create New {kind === 'post' ? 'Post' : 'Milestone'}
        </Link>
      )}
    </div>

    {kind === 'page' && (
      <div className="view-toggle-btns" style={{ marginBottom: '16px' }}>
        {[
          ['all', 'All Sections & Pages'],
          ['home', '🏠 Home Page Sections (6)'],
          ['pages', '📄 Website Pages (11)'],
          ['global', '⚙️ Header & Footer (2)']
        ].map(([cat, label]) => (
          <button
            key={cat}
            type="button"
            className={`view-toggle-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {label}
          </button>
        ))}
      </div>
    )}

    <div className="toolbar" style={{ background: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
      <div style={{ flex: 1, minWidth: '240px' }}>
        <input
          type="text"
          placeholder="🔍 Search content by title or section name..."
          value={q}
          onChange={v => { setQ(v.target.value); setPage(1); }}
        />
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
        Status:
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          {['all', 'draft', 'published', 'trash'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
        </select>
      </label>
    </div>

    {!data ? <Loading error={error} /> : <>
      <div className="list">
        {filteredItems.map(item => {
          const info = sectionMeta(item.key);
          return (
            <Link key={item._id} to={`/admin/edit/${item._id}`}>
              <div>
                <strong style={{ fontSize: '16px' }}>
                  {item.draft.title || info.title || sectionLabel(item.key)}
                </strong>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
                  {info.desc || item.draft.excerpt || 'Click to edit headings, text & images with Live Preview'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="badge" style={{
                  background: item.trashed ? '#fee2e2' : item.published ? '#dcfce7' : '#fef9c3',
                  color: item.trashed ? '#991b1b' : item.published ? '#166534' : '#854d0e'
                }}>
                  {item.trashed ? 'Trash' : item.published ? '✓ Published' : 'Draft'}
                </span>
                <span className="button" style={{ padding: '4px 10px', fontSize: '12px' }}>
                  ✏️ Edit with Preview →
                </span>
              </div>
            </Link>
          );
        })}
        {!filteredItems.length && <p style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No items found in this category.</p>}
      </div>
      <Pager data={data} page={page} setPage={setPage} />
    </>}
  </>;
}

// ─── Field Categorization with Clear Descriptive Headings ───────────────────
function groupSectionFields(fieldsDefinition, draftValues) {
  const groups = {
    images: { title: '🖼️ Images & Visual Assets (फोटो एवं बैकग्राउंड)', desc: 'Banners, background photos and card graphics', fields: [] },
    headings: { title: '📌 Main Headings & Titles (मुख्य शीर्षक एवं सब-हेडिंग्स)', desc: 'Prominent headline text and section titles', fields: [] },
    body: { title: '📝 Paragraphs & Descriptions (मुख्य विवरण एवं पैराग्राफ)', desc: 'Introductory messages and descriptive body copy', fields: [] },
    cards: { title: '💡 Cards, Highlights & FAQs (कार्ड्स एवं प्रश्नोत्तर)', desc: 'Interactive highlights, thematic cards, and FAQ items', fields: [] },
    links: { title: '🔗 Buttons, Links & Navigation (बटन एवं लिंक्स)', desc: 'Button titles and target page URLs', fields: [] },
    general: { title: '⚙️ Additional Content Fields (अन्य सामग्री)', desc: 'Other customizable elements for this section', fields: [] }
  };

  for (const [key, def] of Object.entries(fieldsDefinition || {})) {
    const rawLabel = def.label || key;
    const type = def.type;
    const item = { key, def, cleanTitle: formatFieldTitle(key, rawLabel, type) };

    if (type === 'image') {
      groups.images.fields.push(item);
    } else if (type === 'link') {
      groups.links.fields.push(item);
    } else if (type === 'videoId') {
      groups.cards.fields.push(item);
    } else if (/^heading:/i.test(rawLabel) || /title/i.test(rawLabel) || /^subheading:/i.test(rawLabel)) {
      groups.headings.fields.push(item);
    } else if (/button:/i.test(rawLabel) || /path/i.test(rawLabel) || /href/i.test(rawLabel)) {
      groups.links.fields.push(item);
    } else if (/faqs/i.test(rawLabel) || /questions/i.test(rawLabel) || /cards/i.test(rawLabel) || /features/i.test(rawLabel) || /hosts/i.test(rawLabel) || /stats/i.test(rawLabel) || /themes/i.test(rawLabel) || /beliefs/i.test(rawLabel)) {
      groups.cards.fields.push(item);
    } else if (/text:/i.test(rawLabel) || /story/i.test(rawLabel) || /description/i.test(rawLabel) || ((draftValues?.[key]?.length || 0) > 60)) {
      groups.body.fields.push(item);
    } else {
      groups.general.fields.push(item);
    }
  }

  return Object.entries(groups).filter(([_, g]) => g.fields.length > 0);
}

function formatFieldTitle(key, rawLabel, type) {
  let cleaned = rawLabel
    .replace(/^Image:\s*/i, 'Image: ')
    .replace(/^Heading:\s*/i, '')
    .replace(/^Subheading:\s*/i, 'Subheading: ')
    .replace(/^Text:\s*/i, '')
    .replace(/^Button:\s*/i, 'Button: ')
    .replace(/^Link:\s*/i, 'Link: ')
    .replace(/·\s*/g, ' · ');

  if (cleaned.length > 80) cleaned = cleaned.slice(0, 80) + '...';
  return cleaned || `Field ${key}`;
}

const blankPost = {
  type: 'article',
  title: '',
  slug: '',
  locale: 'en',
  excerpt: '',
  body: '',
  cover: '',
  category: 'Thought Leadership',
  tags: [],
  author: 'Shailendra Bhadauria',
  seoTitle: '',
  seoDescription: '',
  videoUrl: '',
  sourceUrl: ''
};

const blankJourney = { year: '', title: '', text: '', order: 0, locale: 'en' };

function Editor({ user }) {
  const { id, kind } = useParams();
  const { data, error } = useLoad(id ? `/manage/content/${id}` : '/manage/schema');
  if (!data) return <Loading error={error} />;
  return <EditorForm key={id || kind} initial={id ? data : {
    kind, draft: kind === 'post' ? { ...blankPost, author: user.name } : blankJourney
  }} user={user} />;
}

function EditorForm({ initial, user }) {
  const navigate = useNavigate();
  const [doc, setDoc] = useState(initial),
    [draft, setDraft] = useState(initial.draft),
    [saved, setSaved] = useState(JSON.stringify(initial.draft)),
    [locale, setLocale] = useState('en'),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [picker, setPicker] = useState(null),
    [viewMode, setViewMode] = useState('split'), // 'split' | 'form' | 'preview'
    [deviceView, setDeviceView] = useState('desktop'); // 'desktop' | 'mobile'

  const schema = useLoad('/manage/schema');
  const dirty = JSON.stringify(draft) !== saved;
  const skipWarning = useUnsaved(dirty);
  const change = (key, value) => setDraft(d => ({ ...d, [key]: value }));

  const handleTitleChange = (val) => {
    change('title', val);
    if (!doc._id && (!draft.slug || draft.slug === slugify(draft.title))) {
      change('slug', slugify(val));
    }
  };

  async function save() {
    setBusy(true); setError(''); setMessage('');
    try {
      const updated = await api(doc._id ? `/manage/content/${doc._id}` : '/manage/content', {
        method: doc._id ? 'PUT' : 'POST',
        body: doc._id ? { draft, revision: doc.revision } : { kind: doc.kind, draft }
      });
      setDoc(updated); setDraft(updated.draft); setSaved(JSON.stringify(updated.draft));
      setMessage('Draft saved successfully! (Note: Click "Publish Live" below to push changes to the public website).');
      if (!doc._id) { skipWarning.current = true; navigate(`/admin/edit/${updated._id}`, { replace: true }); }
      return updated;
    } catch (e) { setError(e.message); return null; }
    finally { setBusy(false); }
  }

  async function action(actionName) {
    const confirmationText = actionName === 'publish'
      ? 'Publish this content live to the website now?'
      : actionName === 'unpublish'
      ? 'Unpublish this content? It will no longer be visible to visitors.'
      : `${actionName[0].toUpperCase() + actionName.slice(1)} this content?`;

    if (!window.confirm(confirmationText)) return;
    setBusy(true); setError('');
    try {
      const updated = await api(`/manage/content/${doc._id}/${actionName}`, {
        method: 'POST',
        body: { revision: doc.revision }
      });
      setDoc(updated);
      setMessage(`Content ${actionName === 'publish' ? 'published successfully to live website! 🎉' : 'status updated.'}`);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  const field = (name, label, multiline = false, hint = '') => (
    <Field key={name} label={label} value={draft[name]} onChange={v => change(name, v)} multiline={multiline} hint={hint} />
  );

  const sectionMetaInfo = sectionMeta(doc.key);

  return <>
    {/* Breadcrumbs & Header */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
      <div>
        <p className="eyebrow">
          <Link to={`/admin/content/${doc.kind || 'page'}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            ← Back to {doc.kind === 'post' ? 'Posts' : 'Pages'}
          </Link>
          {' · '}
          {doc.kind?.toUpperCase()}
          {' · '}
          {doc.published ? '🟢 LIVE ON WEBSITE' : '🟡 DRAFT MODE'}
          {dirty ? ' · (UNSAVED CHANGES)' : ''}
        </p>
        <h1 style={{ margin: '4px 0 2px' }}>
          {draft.title || sectionMetaInfo.title || sectionLabel(doc.key) || 'Create Content'}
        </h1>
        {sectionMetaInfo.desc && (
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            {sectionMetaInfo.desc} · <a href={sectionRoute(doc.key, doc.kind)} target="_blank" rel="noreferrer" style={{ color: 'var(--admin-primary)', fontWeight: 600 }}>Open page in new tab ↗</a>
          </p>
        )}
      </div>

      {/* Language Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {doc.kind !== 'post' && (
          <div style={{ background: 'white', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Language:</span>
            <select value={locale} onChange={e => setLocale(e.target.value)} style={{ padding: '4px 8px', fontSize: '13px', width: 'auto' }}>
              <option value="en">English (अंग्रेजी)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>
        )}
      </div>
    </div>

    {/* View Mode Controls (Split View, Form Only, Preview Only) */}
    <div className="editor-view-controls">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Editor View Mode:</span>
        <div className="view-toggle-btns">
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'split' ? 'active' : ''}`}
            onClick={() => setViewMode('split')}
          >
            ⚡ Split View (Edit + Live Preview)
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'form' ? 'active' : ''}`}
            onClick={() => setViewMode('form')}
          >
            ✏️ Form Only
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setViewMode('preview')}
          >
            👁️ Live Preview Only
          </button>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
        <span className="live-pulse"></span> Live real-time preview active
      </div>
    </div>

    <Notice error={error} message={message} />

    {/* Main Split Layout */}
    <div className={`editor-split-container ${viewMode === 'form' ? 'form-only' : viewMode === 'preview' ? 'preview-only' : ''}`}>
      {/* LEFT COLUMN: EDIT FORM */}
      {viewMode !== 'preview' && (
        <div className="editor-form-pane">
          <form onSubmit={e => { e.preventDefault(); save(); }}>
            <fieldset disabled={busy || doc.trashed} style={{ border: 'none', padding: 0 }}>
              {doc.kind === 'post' ? (
                /* Post Form with Clear Headings */
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div className="section-group-card">
                    <div className="section-group-header">
                      <div>
                        <h3>📌 Main Title & URL Details (शीर्षक व वेब पता)</h3>
                        <div className="group-desc">Post headline, web link slug, and type of content</div>
                      </div>
                    </div>
                    <div className="section-group-body">
                      <Field
                        label="Article Title / मुख्य शीर्षक *"
                        required
                        placeholder="e.g. Why Learning to Handle Rejection Is an Important Part of Growing Up"
                        value={draft.title}
                        onChange={handleTitleChange}
                      />
                      <div className="form-grid">
                        <Field
                          label="URL Slug (वेब पता) *"
                          required
                          placeholder="e.g. handle-rejection-growing-up"
                          value={draft.slug}
                          onChange={v => change('slug', v)}
                        />
                        <label className="admin-field">
                          Content Type / प्रकार
                          <select value={draft.type} onChange={e => change('type', e.target.value)}>
                            <option value="article">Article / लेख</option>
                            <option value="news">News Coverage / समाचार</option>
                            <option value="video">Video Feature / वीडियो</option>
                          </select>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="section-group-card">
                    <div className="section-group-header">
                      <div>
                        <h3>🖼️ Cover Media & Video (कवर फोटो एवं वीडियो)</h3>
                        <div className="group-desc">Banner photo and optional YouTube video embed</div>
                      </div>
                    </div>
                    <div className="section-group-body">
                      <MediaField
                        label="Featured Cover Image / मुख्य फोटो"
                        value={draft.cover}
                        onChoose={() => setPicker({ select: url => change('cover', url) })}
                        onClear={() => change('cover', '')}
                      />
                      <Field
                        label="Optional YouTube Embed URL"
                        placeholder="https://www.youtube-nocookie.com/embed/VIDEO_ID"
                        value={draft.videoUrl}
                        onChange={v => change('videoUrl', v)}
                        hint="If provided, video plays at top of article"
                      />
                    </div>
                  </div>

                  <div className="section-group-card">
                    <div className="section-group-header">
                      <div>
                        <h3>📝 Excerpt & Full Article Body (सारांश एवं मुख्य लेख)</h3>
                        <div className="group-desc">Short summary for cards and full formatted article body</div>
                      </div>
                    </div>
                    <div className="section-group-body">
                      <Field
                        label="Short Excerpt / सारांश (Card Summary)"
                        multiline
                        placeholder="Brief 1-2 sentence overview shown in card previews..."
                        value={draft.excerpt}
                        onChange={v => change('excerpt', v)}
                      />
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                          Full Article Body (विस्तृत लेख)
                        </span>
                        <RichEditor
                          value={draft.body}
                          onChange={v => change('body', v)}
                          onImage={insert => setPicker({ select: insert })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="section-group-card">
                    <div className="section-group-header">
                      <div>
                        <h3>🏷️ Author, Categories & Tags (लेखक एवं श्रेणियां)</h3>
                        <div className="group-desc">Metadata for categorization and search</div>
                      </div>
                    </div>
                    <div className="section-group-body">
                      <div className="form-grid">
                        <Field label="Category / श्रेणी" value={draft.category} onChange={v => change('category', v)} placeholder="e.g. Youth & Careers" />
                        <Field label="Author Name / लेखक" value={draft.author} onChange={v => change('author', v)} />
                      </div>
                      <Field
                        label="Tags (Comma-separated / टैग्स)"
                        value={draft.tags?.join(', ') || ''}
                        onChange={v => change('tags', v.split(',').map(t => t.trim()).filter(Boolean))}
                        placeholder="e.g. Education, Youth, Viksit Bharat"
                      />
                      <Field
                        label="Original Coverage URL (For News)"
                        value={draft.sourceUrl}
                        onChange={v => change('sourceUrl', v)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="section-group-card">
                    <div className="section-group-header">
                      <div>
                        <h3>🔍 Search Engine Optimization (SEO)</h3>
                        <div className="group-desc">Meta title and description for Google & social sharing</div>
                      </div>
                    </div>
                    <div className="section-group-body">
                      <Field label="SEO Title" value={draft.seoTitle} onChange={v => change('seoTitle', v)} />
                      <Field label="SEO Description" multiline value={draft.seoDescription} onChange={v => change('seoDescription', v)} />
                    </div>
                  </div>
                </div>
              ) : doc.kind === 'journey' ? (
                /* Journey Milestone Form */
                <div className="section-group-card">
                  <div className="section-group-header">
                    <div>
                      <h3>🚀 Milestone Story & Timeline (पड़ाव विवरण)</h3>
                      <div className="group-desc">Configure year, title and milestone description</div>
                    </div>
                  </div>
                  <div className="section-group-body">
                    <div className="form-grid">
                      <Field label="Year / Period (वर्ष/दौर)" value={draft.year} onChange={v => change('year', v)} placeholder="e.g. 1996" required />
                      <Field label="Milestone Title (शीर्षक)" value={draft.title} onChange={v => change('title', v)} placeholder="e.g. Founded MPGI" required />
                    </div>
                    <Field label="Display Order (क्रम)" type="number" value={draft.order} onChange={v => change('order', v)} min={0} />
                    <Field label="Story Description (विवरण)" multiline value={draft.text} onChange={v => change('text', v)} required />
                  </div>
                </div>
              ) : (
                /* Page Sections Form with Clear Headings and Groupings */
                <div style={{ display: 'grid', gap: '20px' }}>
                  {schema.data ? (
                    groupSectionFields(schema.data.sections[doc.key]?.fields, draft[locale]).map(([groupId, group]) => (
                      <div key={groupId} className="section-group-card">
                        <div className="section-group-header">
                          <div>
                            <h3>{group.title}</h3>
                            <div className="group-desc">{group.desc} ({group.fields.length} fields)</div>
                          </div>
                        </div>
                        <div className="section-group-body">
                          {group.fields.map(({ key: fieldKey, def, cleanTitle }) => (
                            def.type === 'image' ? (
                              <MediaField
                                key={fieldKey}
                                label={cleanTitle}
                                value={draft[locale]?.[fieldKey]}
                                onChoose={() => setPicker({
                                  select: url => setDraft(d => ({
                                    ...d,
                                    [locale]: { ...d[locale], [fieldKey]: url }
                                  }))
                                })}
                                onClear={() => setDraft(d => ({
                                  ...d,
                                  [locale]: { ...d[locale], [fieldKey]: '' }
                                }))}
                              />
                            ) : (
                              <Field
                                key={fieldKey}
                                label={cleanTitle}
                                value={draft[locale]?.[fieldKey]}
                                multiline={def.type === 'text' && ((draft[locale]?.[fieldKey]?.length || 0) > 70 || (def.value?.length || 0) > 70)}
                                onChange={val => setDraft(d => ({
                                  ...d,
                                  [locale]: { ...d[locale], [fieldKey]: val }
                                }))}
                                hint={`Field ID: ${fieldKey}`}
                              />
                            )
                          ))}
                        </div>
                      </div>
                    ))
                  ) : <Loading error={schema.error} />}
                </div>
              )}
            </fieldset>

            {/* Sticky Actions Bar */}
            <div className="editor-actions">
              <button type="submit" className="button primary" disabled={busy || doc.trashed}>
                {busy ? 'Saving…' : '💾 Save Draft / सहेजें'}
              </button>

              {doc._id && user.role === 'administrator' && (
                doc.trashed ? (
                  <button type="button" className="button" disabled={busy} onClick={() => action('restore')}>
                    ♻️ Restore from Trash
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="button"
                      style={{ background: '#10b981', color: 'white', borderColor: '#059669' }}
                      disabled={busy || dirty}
                      onClick={() => action('publish')}
                    >
                      🚀 Publish Live to Website
                    </button>

                    {doc.published && (
                      <button type="button" className="button" disabled={busy} onClick={() => action('unpublish')}>
                        Unpublish
                      </button>
                    )}

                    <button type="button" className="button" style={{ color: '#dc2626' }} disabled={busy} onClick={() => action('trash')}>
                      🗑️ Move to Trash
                    </button>
                  </>
                )
              )}

              {dirty && <span className="muted" style={{ display: 'flex', alignItems: 'center' }}>⚠️ Unsaved changes</span>}
            </div>
          </form>
        </div>
      )}

      {/* RIGHT COLUMN: REAL-TIME IN-PLACE LIVE PREVIEW */}
      {viewMode !== 'form' && (
        <div className="live-preview-pane">
          <div className="live-preview-header">
            <div className="live-badge">
              <span className="live-pulse"></span>
              <span>LIVE PREVIEW</span>
            </div>

            <div className="device-switcher">
              <button
                type="button"
                className={`device-btn ${deviceView === 'desktop' ? 'active' : ''}`}
                onClick={() => setDeviceView('desktop')}
                title="Desktop View"
              >
                💻 Desktop
              </button>
              <button
                type="button"
                className={`device-btn ${deviceView === 'mobile' ? 'active' : ''}`}
                onClick={() => setDeviceView('mobile')}
                title="Mobile View"
              >
                📱 Mobile
              </button>
              <a
                href={sectionRoute(doc.key, doc.kind)}
                target="_blank"
                rel="noreferrer"
                className="device-btn"
                style={{ textDecoration: 'none' }}
              >
                🌐 Live Site ↗
              </a>
            </div>
          </div>

          <div className={`live-preview-frame ${deviceView === 'mobile' ? 'mobile' : ''}`}>
            <PreviewErrorBoundary>
              <LiveSectionPreview
                kind={doc.kind}
                docKey={doc.key}
                draft={draft}
                locale={locale}
                sectionMetaInfo={sectionMetaInfo}
              />
            </PreviewErrorBoundary>
          </div>
        </div>
      )}
    </div>

    {picker && <MediaPicker onSelect={url => { picker.select(url); setPicker(null); }} onClose={() => setPicker(null)} />}
  </>;
}

// ─── Real-Time Live Preview Renderer ─────────────────────────────────────────
function LiveSectionPreview({ kind, docKey, draft, locale, sectionMetaInfo }) {
  if (kind === 'post') {
    return (
      <div style={{ padding: '24px', background: '#f8fafc' }}>
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#ff6422', letterSpacing: '1px' }}>
            Card Listing Preview (as seen on Blogs & Home)
          </span>
          <div style={{ maxWidth: '360px', marginTop: '10px' }}>
            <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                {draft.cover ? (
                  <img src={mediaSrc(draft.cover)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#94a3b8', fontSize: '13px' }}>
                    [Cover Photo Preview]
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="text-sm font-semibold tracking-wide text-[#f05d25]">
                  {draft.category || draft.type || 'Thought Leadership'}
                </p>
                <h3 className="mt-2 text-lg font-bold text-[#10283d]">
                  {draft.title || 'Untitled Post'}
                </h3>
                {draft.excerpt && <p className="mt-3 text-sm leading-6 text-slate-600">{draft.excerpt}</p>}
                <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
                  By {draft.author || 'Author'} · Just now
                </div>
              </div>
            </article>
          </div>
        </div>

        <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '20px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#ff6422', letterSpacing: '1px' }}>
            Full Article Page Preview
          </span>
          <article className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm mt-3">
            <p className="text-sm font-semibold tracking-wide text-[#f05d25]">
              {draft.category || draft.type}
            </p>
            <h1 className="mt-3 text-2xl font-extrabold text-[#10283d] md:text-3xl">
              {draft.title || 'Post Title'}
            </h1>
            <div style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 16px' }}>
              By <strong>{draft.author || 'Author'}</strong> · Published preview
            </div>
            {draft.excerpt && <p className="text-base leading-7 text-slate-600 font-medium italic">{draft.excerpt}</p>}
            {draft.videoUrl ? (
              <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-black">
                <iframe src={draft.videoUrl} title={draft.title} className="h-full w-full" allowFullScreen />
              </div>
            ) : draft.cover ? (
              <img className="mt-4 max-h-[22rem] w-full rounded-xl object-cover" src={mediaSrc(draft.cover)} alt="" />
            ) : null}
            <div className="cms-body post-body mt-6" dangerouslySetInnerHTML={{ __html: draft.body || '<p style="color:#94a3b8">[Post body content will render here in real time...]</p>' }} />
          </article>
        </div>
      </div>
    );
  }

  if (kind === 'journey') {
    return (
      <div style={{ padding: '30px 24px', background: '#f8fafc' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#ff6422', letterSpacing: '1px' }}>
          Milestone Timeline Card Preview
        </span>
        <div style={{ marginTop: '16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'inline-block', background: '#fff2ec', color: '#ff6422', border: '1px solid #ff6422', borderRadius: '99px', padding: '4px 14px', fontWeight: 800, fontSize: '13px', marginBottom: '10px' }}>
            {draft.year || 'YEAR'}
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#10283d', margin: '0 0 10px' }}>
            {draft.title || 'Milestone Title'}
          </h2>
          <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, margin: 0 }}>
            {draft.text || 'Milestone description story text will appear here as you type...'}
          </p>
          <div style={{ marginTop: '14px', fontSize: '12px', color: '#94a3b8' }}>
            Display Priority Order: #{draft.order || 0}
          </div>
        </div>
      </div>
    );
  }

  // Page Sections & Settings Live Preview
  const previewContextValue = {
    sections: {
      [docKey]: {
        [locale]: draft[locale] || {},
        [locale === 'en' ? 'hi' : 'en']: draft[locale === 'en' ? 'hi' : 'en'] || draft[locale] || {}
      }
    },
    locale,
    posts: [],
    media: {}
  };

  const Component = getPreviewComponent(docKey);

  return (
    <ContentContext.Provider value={previewContextValue}>
      <div className="live-preview-rendered" style={{ minHeight: '350px' }}>
        {Component ? (
          <Component />
        ) : (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
            <h3>{sectionMetaInfo?.title || docKey}</h3>
            <p>Live preview for this section is active. View changes above.</p>
          </div>
        )}
      </div>
    </ContentContext.Provider>
  );
}

function getPreviewComponent(key) {
  const map = {
    Hero,
    Journey,
    Stats,
    Features,
    YouthConnect,
    ContactInsights,
    Navbar,
    Footer,
    EducationPage,
    JourneyPage,
    Sewapage,
    Sportspage,
    vision2047: Vision2047Page,
    Thoughtleadershippage: ThoughtLeadershipPage,
    Updevelopmentpage: UpDevelopmentPage,
    ChaiPaiCharchaPage: ChaiPaiCharchaPage,
    ConnectPage,
    Nationbuildingpage: NationBuildingPage,
    Mediapage: MediaPage
  };
  return map[key] || null;
}

function sectionMeta(key) {
  const data = {
    Hero: { title: "Home · Main Hero Banner (मुख्य बैनर)", desc: "Main headline, role badges, intro paragraph and background imagery" },
    Journey: { title: "Home · Journey Highlights (मेरी यात्रा कार्ड्स)", desc: "4 key pillar highlight cards (Education, Sewa, Sports, Vision)" },
    Stats: { title: "Home · Impact Statistics (संख्यात्मक उपलब्धियां)", desc: "Numbers and achievements (25+ years, 12+ institutions)" },
    Features: { title: "Home · Media Pillars & Logos (मीडिया एवं मुख्य स्तम्भ)", desc: "News channel logos (Zee, NDTV, Aaj Tak), Youth, Policy" },
    YouthConnect: { title: "Home · Youth Questions (युवा संवाद)", desc: "Direct youth Q&A and personal answers" },
    ContactInsights: { title: "Home · Contact Form & Videos (संपर्क एवं वीडियो)", desc: "YouTube video spotlight and visitor contact form" },
    Navbar: { title: "Site Header & Navigation (नेविगेशन)", desc: "Top navbar links, header photo avatar, menu labels" },
    Footer: { title: "Site Footer (फुटर)", desc: "Footer bio, social links, and quick bottom navigation" },
    EducationPage: { title: "Education Page (शिक्षा पृष्ठ)", desc: "Educational record, philosophy, MPGI campuses, and FAQs" },
    JourneyPage: { title: "Journey Page (मेरी यात्रा पृष्ठ)", desc: "Detailed personal journey, timeline, and core recognitions" },
    Sewapage: { title: "Sewa & Philanthropy (सेवा पृष्ठ)", desc: "Social initiatives, One Graduate One Learner, scholarships" },
    Sportspage: { title: "Sports & Talent (खेल पृष्ठ)", desc: "Chetak Sports, grassroots athletics, why cricket" },
    vision2047: { title: "Vision 2047 (विकसित भारत 2047)", desc: "Four asks (Skill, Education, Accountability, Youth) and goals" },
    Thoughtleadershippage: { title: "Thought Leadership (विचार नेतृत्व)", desc: "4 Core leadership themes and lessons from experience" },
    Updevelopmentpage: { title: "UP Development (उत्तर प्रदेश विकास)", desc: "Medical education, ODOP, ITI modernisation, sports" },
    ChaiPaiCharchaPage: { title: "Coffee Pe Charcha (कॉफी पे चर्चा)", desc: "Podcast episodes, hosts profiles, dialogue topics" },
    ConnectPage: { title: "Connect Page (संपर्क पृष्ठ)", desc: "Speaking requests and official social media handles" },
    Nationbuildingpage: { title: "Nation Building (राष्ट्र निर्माण)", desc: "Where policy meets people and institutional progress" },
    Mediapage: { title: "Media Centre (मीडिया केंद्र)", desc: "Press coverage, newspaper clippings, and digital spotlights" }
  };
  return data[key] || { title: key, desc: "" };
}

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function sectionRoute(key, kind) {
  if (kind === 'journey') return '/journey';
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

function MediaField({ label, value, onChoose, onClear }) {
  return <div className="admin-field">
    <span style={{ fontWeight: 600 }}>{label}</span>
    {value && (
      <div style={{ margin: '8px 0' }}>
        <img className="selected-media" src={mediaSrc(value)} alt="Selected media preview" style={{ borderRadius: '8px', border: '1px solid #cbd5e1', maxHeight: '140px' }} />
      </div>
    )}
    <div className="toolbar" style={{ margin: '4px 0' }}>
      <button type="button" className="button" onClick={onChoose}>
        {value ? '🔄 Replace Image' : '🖼️ Choose Image from Library'}
      </button>
      {value && onClear && (
        <button type="button" className="button" onClick={onClear} style={{ color: '#dc2626' }}>
          Remove
        </button>
      )}
    </div>
  </div>;
}

function RichEditor({ value, onChange, onImage }) {
  const ref = useRef(null), range = useRef(null);
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

  return <div className="admin-field" style={{ margin: 0 }}>
    <div className="rich-toolbar" role="toolbar" aria-label="Text formatting">
      {[
        ['bold', 'B (Bold)'],
        ['italic', 'I (Italic)'],
        ['insertUnorderedList', '• Bullets'],
        ['insertOrderedList', '1. Numbers'],
        ['formatBlock', 'H2 Heading', 'h2'],
        ['formatBlock', 'Paragraph', 'p'],
        ['undo', '↩ Undo'],
        ['redo', '↪ Redo']
      ].map(([cmd, label, arg]) => (
        <button type="button" key={label} onMouseDown={e => e.preventDefault()} onClick={() => command(cmd, arg)}>{label}</button>
      ))}
      <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => {
        const url = window.prompt('Enter link URL (e.g. https://...):');
        if (url && /^https?:\/\//.test(url)) command('createLink', url);
      }}>🔗 Insert Link</button>
      <button type="button" onClick={() => {
        remember();
        onImage(url => command('insertImage', url));
      }}>🖼️ Insert Image</button>
    </div>
    <div
      ref={ref}
      className="rich-editor cms-body"
      role="textbox"
      aria-label="Post body"
      aria-multiline="true"
      contentEditable
      suppressContentEditableWarning
      onInput={() => onChange(ref.current.innerHTML)}
      onKeyUp={remember}
      onMouseUp={remember}
      onPaste={e => {
        e.preventDefault();
        command('insertText', e.clipboardData.getData('text/plain'));
      }}
      onDrop={e => e.preventDefault()}
    />
  </div>;
}

function MediaPicker({ onSelect, onClose }) {
  const ref = useRef(null);
  useEffect(() => { ref.current.showModal(); }, []);
  return <dialog ref={ref} className="admin media-dialog" aria-label="Choose an image" onCancel={onClose} style={{
    width: 'min(1000px, 94vw)',
    maxHeight: '85vh',
    borderRadius: '16px',
    border: 'none',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    padding: '24px'
  }}>
    <div className="heading">
      <h2>Select an Image from Media Library</h2>
      <button type="button" className="button" onClick={onClose}>✕ Close</button>
    </div>
    <MediaLibrary onSelect={url => { ref.current.close(); onSelect(url); }} />
  </dialog>;
}

function MediaLibrary({ user, onSelect }) {
  const [q, setQ] = useState(''), [page, setPage] = useState(1),
    [error, setError] = useState(''), [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false), [file, setFile] = useState(null), [alt, setAlt] = useState('');
  const inputRef = useRef(null);
  const { data, error: loadError, reload } = useLoad(`/manage/media?${new URLSearchParams({ q, page, limit: 12 })}`);

  async function upload(e) {
    e.preventDefault();
    if (!file) return;
    setBusy(true); setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('alt', alt);
      const item = await api('/manage/media', { method: 'POST', body });
      setMessage('Image uploaded successfully.');
      setFile(null); setAlt('');
      if (inputRef.current) inputRef.current.value = '';
      reload();
      if (onSelect) onSelect(item.url);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return <>
    {!onSelect && (
      <>
        <p className="eyebrow">ASSETS & PHOTOS</p>
        <h1>Media Library</h1>
        <p className="subtext">Upload images (JPG, PNG, WebP up to 10MB) for blogs, articles, and page sections.</p>
      </>
    )}
    <Notice error={error || loadError} message={message} />

    <form className="panel" onSubmit={upload} style={{ display: 'grid', gap: '14px' }}>
      <h3 style={{ margin: 0 }}>Upload New Image</h3>
      <div className="form-grid">
        <label className="admin-field">
          Choose Image File
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" required onChange={e => setFile(e.target.files[0])} />
        </label>
        <Field label="Alt Text / Description (विवरण)" value={alt} onChange={setAlt} placeholder="e.g. Shailendra Bhadauria addressing university students" />
      </div>
      <div>
        <button type="submit" className="button primary" disabled={busy}>
          {busy ? 'Uploading & optimizing…' : '⬆️ Upload to Library'}
        </button>
      </div>
    </form>

    <div className="toolbar" style={{ margin: '20px 0 10px' }}>
      <input
        type="text"
        placeholder="🔍 Search images by filename..."
        value={q}
        onChange={v => { setQ(v.target.value); setPage(1); }}
        style={{ maxWidth: '360px' }}
      />
    </div>

    {data && <>
      <div className="media-grid">
        {data.items.map(m => (
          <div className="panel" key={m._id}>
            <img src={mediaSrc(m.url)} alt={m.alt} />
            <strong style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.originalName}</strong>
            <small style={{ color: '#64748b' }}>{m.width} × {m.height} px · {Math.round(m.size / 1024)} KB</small>
            <div className="toolbar" style={{ marginTop: '12px' }}>
              {onSelect ? (
                <button type="button" className="button primary" style={{ width: '100%' }} onClick={() => onSelect(m.url)}>
                  ✓ Select This Image
                </button>
              ) : (
                <>
                  <button type="button" className="button" onClick={async () => {
                    const value = window.prompt('Edit alt description:', m.alt);
                    if (value === null) return;
                    try { await api(`/manage/media/${m._id}`, { method: 'PATCH', body: { alt: value } }); reload(); }
                    catch (e) { setError(e.message); }
                  }}>Edit Description</button>
                  {user?.role === 'administrator' && (
                    <button type="button" className="button" style={{ color: '#dc2626' }} disabled={!!m.usage.length} onClick={async () => {
                      if (!window.confirm('Delete this image permanently?')) return;
                      try { await api(`/manage/media/${m._id}`, { method: 'DELETE' }); reload(); }
                      catch (e) { setError(e.message); }
                    }}>Delete</button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {!data.items.length && <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No images found.</p>}
      <Pager data={data} page={page} setPage={setPage} />
    </>}
  </>;
}

function Users() {
  const [page, setPage] = useState(1), [q, setQ] = useState(''),
    [form, setForm] = useState({ email: '', name: '', password: '', role: 'editor' }),
    [error, setError] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  const { data, error: loadError, reload } = useLoad(`/manage/users?${new URLSearchParams({ page, q })}`);

  async function update(id, body) {
    try { await api(`/manage/users/${id}`, { method: 'PATCH', body }); reload(); }
    catch (e) { setError(e.message); }
  }

  return <>
    <p className="eyebrow">ACCESS & PERMISSIONS</p>
    <h1>Staff Users</h1>
    <p className="subtext">Manage accounts for team members who can write or publish content.</p>
    <Notice error={error || loadError} message={message} />

    <form className="panel" onSubmit={async e => {
      e.preventDefault(); setBusy(true);
      try {
        await api('/manage/users', { method: 'POST', body: form });
        setForm({ email: '', name: '', password: '', role: 'editor' });
        setMessage('New staff user account created.'); reload();
      } catch (e) { setError(e.message); }
      finally { setBusy(false); }
    }}>
      <h2>Create New Staff User</h2>
      <div className="form-grid">
        <Field label="Full Name / नाम" value={form.name} required onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Rahul Sharma" />
        <Field label="Email Address / ईमेल" type="email" value={form.email} required onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="user@shalinder.com" />
        <Field label="Password (Min 12 characters)" type="password" value={form.password} required minLength={12} onChange={v => setForm(f => ({ ...f, password: v }))} placeholder="••••••••••••" />
        <label className="admin-field">
          Role / भूमिका
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="editor">Editor (Can draft & edit content)</option>
            <option value="administrator">Administrator (Full publishing & user control)</option>
          </select>
        </label>
      </div>
      <button className="primary" disabled={busy}>{busy ? 'Creating…' : 'Create Staff Account'}</button>
    </form>

    <div className="toolbar" style={{ margin: '20px 0 10px' }}>
      <input
        type="text"
        placeholder="🔍 Search users by email..."
        value={q}
        onChange={v => { setQ(v.target.value); setPage(1); }}
        style={{ maxWidth: '360px' }}
      />
    </div>

    {data && <>
      <div className="list">
        {data.items.map(u => (
          <div key={u._id}>
            <div>
              <strong>{u.name}</strong>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{u.email}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge" style={{
                background: u.disabled ? '#fee2e2' : '#dcfce7',
                color: u.disabled ? '#991b1b' : '#166534'
              }}>
                {u.disabled ? 'Disabled' : 'Active'} · {u.role}
              </span>
              <button className="button" onClick={() => { if (window.confirm('Change account status?')) update(u._id, { disabled: !u.disabled }); }}>
                {u.disabled ? 'Enable' : 'Disable'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <Pager data={data} page={page} setPage={setPage} />
    </>}
  </>;
}

function sectionLabel(key) {
  return sectionMeta(key).title || key;
}
