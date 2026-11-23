import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import sharp from 'sharp';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { User, Content, Media, Activity, Contact } from './models.js';
import { SqliteSessionStore } from './sqliteStore.js';
import { hashPassword, verifyPassword, problem, mediaRefs } from './security.js';
import { credentials, userInput, validateContent, manifest } from './validation.js';

const id = z.string().regex(/^[a-f\d]{24}$/);
const kinds = z.enum(['post', 'page', 'journey', 'settings']);
const publicFilter = {
  trashed: false,
  published: { $ne: null }
};

function pagination(query) {
  return z.object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    q: z.string().max(100).default('')
  }).parse(query);
}

const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const dto = d => ({
  id: d._id,
  ...d.published,
  publishedAt: d.publishedAt
});

export function createApp(config) {
  const app = express();
  app.locals.dbReady = true; // SQLite is always ready

  if (config.production) app.set('trust proxy', 1);

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        'frame-src': [
          "'self'",
          'https://www.youtube-nocookie.com',
          'https://www.youtube.com',
          'https://player.vimeo.com'
        ],
        'img-src': [
          "'self'",
          'data:',
          'https://i.ytimg.com'
        ]
      }
    },
    crossOriginResourcePolicy: { policy: 'same-site' }
  }));

  app.use(cors({
    origin: config.origin,
    credentials: true
  }));

  app.use(express.json({ limit: '1mb' }));

  const store = new SqliteSessionStore();
  app.locals.sessionStore = store;

  app.get('/api/health', (_req, res) => res.json({ ok: true, database: 'ready' }));

  app.use(session({
    name: 'shalinder.sid',
    secret: config.secret,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      httpOnly: true,
      secure: config.production,
      sameSite: 'lax',
      maxAge: 8 * 3600 * 1000
    }
  }));

  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  // CSRF protection for state-changing requests
  app.use('/api', (req, _res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    // Skip CSRF for public contact form submissions
    if (req.path === '/public/contact') return next();
    const origin = req.get('origin');
    const isAllowedOrigin = origin === config.origin || (!config.production && (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')));
    if (!isAllowedOrigin) throw problem(403, 'Untrusted request origin');
    if (!req.session.csrf || req.get('x-csrf-token') !== req.session.csrf) throw problem(403, 'Invalid CSRF token. Reload and retry.');
    next();
  });

  const auth = async (req, _res, next) => {
    const user = req.session.userId && (await User.findById(req.session.userId));
    if (!user || user.disabled || user.sessionVersion !== req.session.version) throw problem(401, 'Please sign in');
    req.user = user;
    next();
  };

  const admin = (req, _res, next) => {
    if (req.user.role !== 'administrator') throw problem(403, 'Administrator permission required');
    next();
  };

  const activity = (req, action, target) => Activity.create({
    actor: req.user._id,
    action,
    target: String(target)
  });

  // ─── Auth ───────────────────────────────────────────────
  app.get('/api/auth/csrf', (req, res) => {
    req.session.csrf ||= randomBytes(32).toString('hex');
    res.json({ csrf: req.session.csrf });
  });

  app.post('/api/auth/login', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: { message: 'Too many login attempts. Try again in 15 minutes.' } }
  }), async (req, res) => {
    const { email, password } = credentials.parse(req.body);
    const user = await User.findOne({ email }).select('+passwordHash');
    const valid = await verifyPassword(password, user?.passwordHash);
    if (!valid || !user || user.disabled) throw problem(401, 'Invalid email or password');
    await new Promise((resolve, reject) => req.session.regenerate(err => err ? reject(err) : resolve()));
    req.session.userId = String(user._id);
    req.session.version = user.sessionVersion;
    req.session.csrf = randomBytes(32).toString('hex');
    res.json({
      user: { id: user._id, name: user.name, role: user.role },
      csrf: req.session.csrf
    });
  });

  app.get('/api/auth/me', auth, (req, res) => res.json({
    user: { id: req.user._id, name: req.user.name, role: req.user.role },
    csrf: req.session.csrf
  }));

  app.post('/api/auth/logout', auth, async (req, res) => {
    await new Promise((resolve, reject) => req.session.destroy(err => err ? reject(err) : resolve()));
    res.clearCookie('shalinder.sid');
    res.json({ ok: true });
  });

  // ─── Public site content ───────────────────────────────
  async function site(preview = false) {
    const docs = await Content.find(preview ? {
      kind: { $in: ['page', 'settings', 'journey'] },
      trashed: false
    } : {
      kind: { $in: ['page', 'settings', 'journey'] },
      ...publicFilter
    }).lean();
    return {
      sections: Object.fromEntries(docs.filter(d => d.kind !== 'journey').map(d => [d.key, preview ? d.draft : d.published])),
      journey: docs.filter(d => d.kind === 'journey').map(d => preview ? d.draft : d.published).sort((a, b) => a.order - b.order)
    };
  }

  app.get('/api/public/site', async (_req, res) => res.json(await site()));

  app.get('/api/public/posts', async (req, res) => {
    const { page, limit, q } = pagination(req.query);
    const filter = { kind: 'post', ...publicFilter };
    if (req.query.type) filter['published.type'] = z.enum(['article', 'news', 'video']).parse(req.query.type);
    if (req.query.locale) filter['published.locale'] = z.enum(['en', 'hi']).parse(req.query.locale);
    if (req.query.category) filter['published.category'] = z.string().max(100).parse(req.query.category);
    if (req.query.tag) filter['published.tags'] = z.string().max(50).parse(req.query.tag);
    if (q) filter['published.title'] = { $regex: escapeRegex(q), $options: 'i' };
    const [items, total] = await Promise.all([
      Content.find(filter).sort({ publishedAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Content.countDocuments(filter)
    ]);
    res.json({ items: items.map(dto), total, page, limit });
  });

  app.get('/api/public/posts/:slug', async (req, res) => {
    const doc = await Content.findOne({ kind: 'post', 'published.slug': req.params.slug, ...publicFilter }).lean();
    if (!doc) throw problem(404, 'Post not found');
    res.json(dto(doc));
  });

  // ─── Public Contact Form Submission ─────────────────────
  app.post('/api/public/contact', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: { error: { message: 'Too many contact submissions. Please try again later.' } }
  }), async (req, res) => {
    const contactSchema = z.object({
      name: z.string().min(1).max(200),
      ageGroup: z.string().min(1).max(50),
      location: z.string().min(1).max(300),
      interest: z.string().min(1).max(100),
      message: z.string().min(1).max(5000)
    }).strict();

    const data = contactSchema.parse(req.body);
    const doc = Contact.insert({
      ...data,
      status: 'new',      // new | read | replied | archived
      notes: ''
    });
    res.status(201).json({ ok: true, message: 'Your message has been submitted successfully.' });
  });

  // ─── Media serving ─────────────────────────────────────
  async function references(mediaId, publishedOnly = false) {
    const ref = String(mediaId);
    const docs = await Content.find(publishedOnly
      ? { ...publicFilter, publishedMedia: ref }
      : { $or: [{ draftMedia: ref }, { publishedMedia: ref }] }
    ).select('key kind').lean();
    return docs.map(d => ({ id: d._id, key: d.key, kind: d.kind }));
  }

  app.get('/api/media/:id', async (req, res) => {
    const doc = await Media.findById(id.parse(req.params.id));
    if (!doc) throw problem(404, 'Media not found');
    if (!(await references(doc._id, true)).length) {
      const user = req.session.userId && (await User.findById(req.session.userId));
      if (!user || user.disabled || user.sessionVersion !== req.session.version) throw problem(404, 'Media not found');
    }
    res.set({
      'Content-Type': doc.mime,
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store'
    });
    res.sendFile(doc.filename, { root: config.uploadDir, dotfiles: 'deny' });
  });

  // ─── Admin management routes ───────────────────────────
  app.use('/api/manage', auth);

  let writeQueue = Promise.resolve();
  app.use('/api/manage', async (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    let release;
    const previous = writeQueue;
    writeQueue = new Promise(resolve => { release = resolve; });
    await previous;
    if (req.aborted || res.destroyed) { release(); return; }
    res.once('finish', release);
    res.once('close', release);
    try {
      await auth(req, res, () => next());
    } catch (error) {
      release();
      next(error);
    }
  });

  app.get('/api/manage/schema', (_req, res) => res.json({ sections: manifest.sections }));
  app.get('/api/manage/preview/site', async (_req, res) => res.json(await site(true)));

  app.get('/api/manage/dashboard', async (_req, res) => {
    const [posts, published, drafts, media, contacts, activityItems] = await Promise.all([
      Content.countDocuments({ kind: 'post', trashed: false }),
      Content.countDocuments({ kind: 'post', ...publicFilter }),
      Content.countDocuments({ kind: 'post', published: null, trashed: false }),
      Media.countDocuments(),
      Contact.countDocuments(),
      Activity.find().sort({ createdAt: -1 }).limit(20).select('action target createdAt').lean()
    ]);
    res.json({ posts, published, drafts, media, contacts, activity: activityItems });
  });

  // ─── Content CRUD ──────────────────────────────────────
  app.get('/api/manage/content', async (req, res) => {
    const { page, limit, q } = pagination(req.query);
    const filter = {
      kind: kinds.parse(req.query.kind || 'post'),
      trashed: req.query.status === 'trash'
    };
    if (req.query.status === 'published') filter.published = { $ne: null };
    if (req.query.status === 'draft') filter.published = null;
    if (q) filter.$or = [
      { 'draft.title': { $regex: escapeRegex(q), $options: 'i' } },
      { key: { $regex: escapeRegex(q), $options: 'i' } }
    ];
    const [items, total] = await Promise.all([
      Content.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Content.countDocuments(filter)
    ]);
    res.json({ items, total, page, limit });
  });

  app.get('/api/manage/content/:id', async (req, res) => {
    const doc = await Content.findById(id.parse(req.params.id));
    if (!doc) throw problem(404, 'Content not found');
    res.json(doc);
  });

  app.post('/api/manage/content', async (req, res) => {
    const input = z.object({
      kind: kinds,
      key: z.string().max(100).optional(),
      draft: z.unknown()
    }).strict().parse(req.body);
    const key = ['post', 'journey'].includes(input.kind) ? `${input.kind}-${randomUUID()}` : input.key;
    const draft = validateContent(input.kind, key, input.draft);
    await ensureMedia(draft);
    const doc = await Content.create({
      kind: input.kind,
      key,
      draft,
      draftMedia: mediaRefs(draft),
      updatedBy: req.user._id,
      revision: 0,
      trashed: false,
      published: null
    });
    await activity(req, 'create', doc._id);
    res.status(201).json(doc);
  });

  async function ensureMedia(value) {
    const refs = mediaRefs(value);
    if (refs.length !== (await Media.countDocuments({ _id: { $in: refs } }))) throw problem(400, 'A selected media item no longer exists');
  }

  app.put('/api/manage/content/:id', async (req, res) => {
    const input = z.object({
      draft: z.unknown(),
      revision: z.number().int().min(0)
    }).strict().parse(req.body);
    const doc = await Content.findById(id.parse(req.params.id));
    if (!doc) throw problem(404, 'Content not found');
    if (doc.trashed) throw problem(409, 'Restore this item first');
    const draft = validateContent(doc.kind, doc.key, input.draft);
    await ensureMedia(draft);
    const updated = await Content.findOneAndUpdate(
      { _id: doc._id, revision: input.revision },
      { $set: { draft, draftMedia: mediaRefs(draft), updatedBy: req.user._id }, $inc: { revision: 1 } },
      { new: true }
    );
    if (!updated) throw problem(409, 'Someone else changed this item. Reload before saving.');
    await activity(req, 'save draft', doc._id);
    res.json(updated);
  });

  app.post('/api/manage/content/:id/:action', admin, async (req, res) => {
    const action = z.enum(['publish', 'unpublish', 'trash', 'restore']).parse(req.params.action);
    const { revision } = z.object({ revision: z.number().int().min(0) }).strict().parse(req.body);
    const doc = await Content.findById(id.parse(req.params.id));
    if (!doc) throw problem(404, 'Content not found');
    if (doc.revision !== revision) throw problem(409, 'Content changed. Reload before continuing.');
    if (action === 'publish' && doc.trashed) throw problem(409, 'Restore before publishing');
    const changes = {};
    if (action === 'publish') {
      changes.published = validateContent(doc.kind, doc.key, doc.draft);
      changes.publishedMedia = mediaRefs(changes.published);
      await ensureMedia(changes.published);
      changes.publishedAt = new Date();
    }
    if (['unpublish', 'trash'].includes(action)) {
      changes.published = null;
      changes.publishedMedia = [];
      changes.publishedAt = null;
    }
    if (action === 'trash') changes.trashed = true;
    if (action === 'restore') changes.trashed = false;
    const updated = await Content.findOneAndUpdate(
      { _id: doc._id, revision },
      { $set: changes, $inc: { revision: 1 } },
      { new: true }
    );
    if (!updated) throw problem(409, 'Content changed. Retry.');
    await activity(req, action, doc._id);
    res.json(updated);
  });

  // ─── Media upload ──────────────────────────────────────
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 2, parts: 3 }
  }).single('file');

  app.post('/api/manage/media', upload, async (req, res) => {
    if (!req.file) throw problem(400, 'Choose an image (JPEG, PNG or WebP; maximum 10 MB)');
    const alt = z.string().max(500).parse(req.body.alt || '');
    let data, info;
    try {
      const input = sharp(req.file.buffer, { limitInputPixels: 40000000, animated: false });
      const metadata = await input.metadata();
      if (!['jpeg', 'png', 'webp'].includes(metadata.format)) throw new Error();
      ({ data, info } = await input.rotate().resize({
        width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true
      }).webp({ quality: 85 }).toBuffer({ resolveWithObject: true }));
    } catch {
      throw problem(400, 'Invalid image. Only genuine JPEG, PNG and WebP files up to 40 megapixels are allowed.');
    }
    const filename = `${randomUUID()}.webp`;
    await mkdir(config.uploadDir, { recursive: true });
    await writeFile(path.join(config.uploadDir, filename), data, { flag: 'wx' });
    let doc;
    try {
      doc = await Media.create({
        filename,
        originalName: req.file.originalname.slice(0, 200),
        mime: 'image/webp',
        size: info.size,
        width: info.width,
        height: info.height,
        alt,
        createdBy: req.user._id
      });
    } catch (error) {
      await unlink(path.join(config.uploadDir, filename));
      throw error;
    }
    await activity(req, 'upload', doc._id);
    res.status(201).json({ ...doc.toObject(), url: `/api/media/${doc._id}` });
  });

  app.get('/api/manage/media', async (req, res) => {
    const { page, limit, q } = pagination(req.query);
    const filter = q ? { originalName: { $regex: escapeRegex(q), $options: 'i' } } : {};
    const [items, total] = await Promise.all([
      Media.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Media.countDocuments(filter)
    ]);
    res.json({
      items: await Promise.all(items.map(async m => ({
        ...m,
        url: `/api/media/${m._id}`,
        usage: await references(m._id)
      }))),
      total, page, limit
    });
  });

  app.patch('/api/manage/media/:id', async (req, res) => {
    const { alt } = z.object({ alt: z.string().max(500) }).strict().parse(req.body);
    const doc = await Media.findByIdAndUpdate(id.parse(req.params.id), { alt }, { new: true });
    if (!doc) throw problem(404, 'Media not found');
    res.json(doc);
  });

  app.delete('/api/manage/media/:id', admin, async (req, res) => {
    const mediaId = id.parse(req.params.id);
    if ((await references(mediaId)).length) throw problem(409, 'Media is referenced by content. Replace those references first.');
    const doc = await Media.findById(mediaId);
    if (!doc) throw problem(404, 'Media not found');
    await unlink(path.join(config.uploadDir, doc.filename)).catch(e => { if (e.code !== 'ENOENT') throw e; });
    await doc.deleteOne();
    await activity(req, 'delete media', mediaId);
    res.json({ ok: true });
  });

  // ─── Contact management (admin) ────────────────────────
  app.get('/api/manage/contacts', auth, async (req, res) => {
    const { page, limit, q } = pagination(req.query);
    const statusFilter = req.query.status && req.query.status !== 'all' ? { status: req.query.status } : {};
    const searchFilter = q ? {
      $or: [
        { name: { $regex: escapeRegex(q), $options: 'i' } },
        { location: { $regex: escapeRegex(q), $options: 'i' } },
        { message: { $regex: escapeRegex(q), $options: 'i' } }
      ]
    } : {};
    const filter = { ...statusFilter, ...searchFilter };
    const [items, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Contact.countDocuments(filter)
    ]);
    res.json({ items, total, page, limit });
  });

  app.patch('/api/manage/contacts/:id', auth, async (req, res) => {
    const change = z.object({
      status: z.enum(['new', 'read', 'replied', 'archived']).optional(),
      notes: z.string().max(5000).optional()
    }).strict().parse(req.body);
    const doc = await Contact.findByIdAndUpdate(id.parse(req.params.id), { $set: change }, { new: true });
    if (!doc) throw problem(404, 'Contact not found');
    res.json(doc);
  });

  app.delete('/api/manage/contacts/:id', admin, async (req, res) => {
    const contactId = id.parse(req.params.id);
    const doc = await Contact.findById(contactId);
    if (!doc) throw problem(404, 'Contact not found');
    await doc.deleteOne();
    res.json({ ok: true });
  });

  // ─── Users management ─────────────────────────────────
  app.get('/api/manage/users', admin, async (req, res) => {
    const { page, limit, q } = pagination(req.query);
    const filter = q ? { email: { $regex: escapeRegex(q), $options: 'i' } } : {};
    res.json({
      items: await User.find(filter).select('name email role disabled').skip((page - 1) * limit).limit(limit).lean(),
      total: await User.countDocuments(filter),
      page, limit
    });
  });

  app.post('/api/manage/users', admin, async (req, res) => {
    const { password, ...data } = userInput.parse(req.body);
    const user = await User.create({ ...data, passwordHash: await hashPassword(password) });
    await activity(req, 'create user', user._id);
    res.status(201).json({ id: user._id });
  });

  app.patch('/api/manage/users/:id', admin, async (req, res) => {
    const userId = id.parse(req.params.id);
    if (userId === String(req.user._id)) throw problem(400, 'Use another administrator to change your own access');
    const change = z.object({
      disabled: z.boolean().optional(),
      role: z.enum(['administrator', 'editor']).optional()
    }).strict().parse(req.body);
    const user = await User.findByIdAndUpdate(userId, { $set: change, $inc: { sessionVersion: 1 } }, { new: true });
    if (!user) throw problem(404, 'User not found');
    await activity(req, 'change user access', userId);
    res.json({ ok: true });
  });

  // ─── 404 and error handling ────────────────────────────
  app.use('/api', (_req, _res, next) => next(problem(404, 'Endpoint not found')));

  app.use((err, _req, res, _next) => {
    let status = err.status || 500,
      message = status === 500 ? 'Internal server error' : err.message;
    if (err instanceof z.ZodError) {
      status = 400;
      message = err.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    }
    if (err.code === 'ER_DUP_ENTRY' || err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.code === 'SQLITE_CONSTRAINT') {
      status = 409;
      message = 'This slug, email or section already exists.';
    }
    if (err instanceof multer.MulterError) {
      status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      message = 'Upload rejected: use one image no larger than 10 MB.';
    }
    if (status === 500) console.error(err);
    res.status(status).json({ error: { message } });
  });

  // Static file serving
  app.use(express.static(config.frontendDir, {
    index: false,
    fallthrough: true,
    maxAge: config.production ? '1h' : 0
  }));
  app.get(/^(?!\/api(?:\/|$)).*/, (_req, res, next) => {
    res.sendFile(config.indexFile, error => error && next(error));
  });

  return app;
}
