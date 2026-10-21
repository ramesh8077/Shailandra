# Shalinder CMS handover

The existing React 19 + Vite 8 + Tailwind 3 JSX site now reads content from an Express 5 / Mongoose 8 CMS. No production deployment or external account was created. The backend uses MongoDB (Atlas recommended) for content, staff and sessions, and a persistent filesystem directory for images.

## Content inventory and mapping

The exact field inventory, source paths, labels and original values are in [server/content-manifest.json](./server/content-manifest.json). Only these named sections and fields are accepted by the page/settings APIs. Text is rendered through React, never interpreted as arbitrary page HTML. Existing classes, responsive layouts and animation classes remain in the JSX components.

| Public route | Admin section(s) | Editable content |
| --- | --- | --- |
| `/` | Hero, Journey, Stats, Features, YouthConnect, ContactInsights | Hero copy and images, role links, journey cards, statistics, media logos, feature cards, questions/answers, contact labels and YouTube insight IDs |
| All routes | Website settings: Navbar, Footer | Navigation labels/links, portrait, footer copy and social links |
| `/journey` | JourneyPage + Journey records | Hero, story, beliefs, ethos, family/recognition text and images; independently add/edit/order timeline entries |
| `/education` | EducationPage | Hero, institutional record, philosophy, system/outcome copy, FAQ and conversation labels; related posts use category `Education` |
| `/sewa` | Sewapage | Introduction, circle steps, entrepreneurship/support copy and images |
| `/sports` | Sportspage | Sports cards, images and descriptions |
| `/vision-2047` | vision2047 | Hero, vision copy, four asks, FAQ and conversation labels; category `Vision 2047` posts |
| `/thought-leadership` | Thoughtleadershippage + Posts | Hero, introduction, themes and letters section; published articles, category links and related reading |
| `/updevelopment` | Updevelopmentpage | Hero, introduction, case study slide copy/source links, FAQs; category `UP Development` posts |
| `/चाय-पै-चर्चा` | ChaiPaiCharchaPage + Posts | Intro, hosts, social links, season headings and conversation labels; video posts in category `Chai Pe Charcha` |
| `/connect` | ConnectPage | Hero, contact/social links, copy and form labels |
| `/nation-building` | Nationbuildingpage + Posts | Policy/vision copy and images, FAQ/conversation labels; news feed, video feed and category `Nation Building` articles |
| `/media` | Mediapage | Facts, quote copy/images, English/Hindi bio, topics, gallery images/alt text, press logos and labels |
| `/posts`, `/posts/:slug` | Posts | Paginated searchable published articles/news/videos and full detail pages |

Page sections retain the existing fixed layout and field slots; adding entirely new layout sections requires a code/schema change. Posts and timeline entries can be added freely. Hindi and English are separate editable page dictionaries; existing copy is copied into both on migration as a starting point, **not an approved Hindi translation**. Posts/timeline records each have a language. Marketing must review legacy placeholders, claims and Hindi translations.

The incorrect `../../public/Journery-Images/...` imports were removed by the content migration. Original filenames, including the spelling `Journery-Images`, are recorded in the manifest; seed copies and optimizes them into managed media. Other originals remain untouched. The `SewaPage` import now matches the actual `Sewapage.jsx` filename for Linux deployment. No screenshot was attached, so fixes were based on the actual source imports.

## Changed-file summary

- [server/src/](./server/src/): config, content/staff/media/activity models, authentication, validation, management/public APIs, controlled image serving, explicit seed and account CLI commands.
- [server/test/cms.test.js](./server/test/cms.test.js): integration tests with an isolated real MongoDB test process and actual image encoding.
- [src/cms/](./src/cms/): separate admin layout/login, database dashboard, content forms, rich text, media picker/library, staff management, public provider, listings and detail routes.
- [src/App.jsx](./src/App.jsx), [src/components/](./src/components/), [src/pages/](./src/pages/): CMS connections, corrected import case and published feeds, preserving existing public styling.
- [vite.config.js](./vite.config.js): development `/api` proxy to port 4000.
- [.env.example](./.env.example), [server/.env.example](./server/.env.example), [.gitignore](./.gitignore): local configuration templates and exclusions.
- [scripts/](./scripts/): one-time source conversion utilities used for this implementation. **Do not rerun these on the already migrated source.** The supported repeatable migration is `npm.cmd run seed` in the backend.

There is no usable Git metadata in the supplied project folder; Git status reported an error pointing outside this folder. No commits, resets or deployments were made. Existing `dist` and root dependency files were not used as edit targets. Backend dependency installation created its own lockfile.

## Windows PowerShell setup

Use Node.js 22.12 or newer (Node 22 LTS recommended). The existing frontend versions are retained. Use `npm.cmd` to avoid PowerShell script execution-policy restrictions.

```powershell
Set-Location C:\Users\91975\Shalinderweb
npm.cmd ci
Copy-Item .env.example .env
Set-Location server
npm.cmd ci
Copy-Item .env.example .env
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Edit the backend `.env`: paste the generated value into `SESSION_SECRET`, set `MONGODB_URI`, and choose an **absolute persistent directory outside this repository**, for example `C:/shalinder-data/uploads`. Create that directory and grant read/write permission only to the Node service account and backup operator. Never put secrets in `VITE_*` values. Keep frontend `VITE_API_BASE` empty for the supported same-origin proxy setup.

```powershell
# Run from C:\Users\91975\Shalinderweb\server after configuring .env
New-Item -ItemType Directory -Force C:\shalinder-data\uploads
npm.cmd run setup-admin
# Prompts for email, display name and a hidden password of at least 12 characters.
# Refuses to create another first administrator once an administrator exists.
npm.cmd run seed
# Explicitly imports existing pages/images; never runs on server startup.
# Existing records are left unchanged on subsequent runs.
npm.cmd run dev
```

In a second terminal:

```powershell
Set-Location C:\Users\91975\Shalinderweb
npm.cmd run dev
```

Open `http://localhost:5173` and `http://localhost:5173/admin`. Use `localhost` consistently: the configured origin is exactly `http://localhost:5173` (using `127.0.0.1` in the browser requires updating `FRONTEND_ORIGIN`).

### Atlas setup

1. Use an existing Atlas project/cluster or create one yourself; this implementation does not purchase a plan.
2. Create a database user scoped to `readWrite` on the chosen application database. Do not use the Atlas account password as the database password.
3. Allow only the development IP and later the deployment egress IP in Network Access. Do not leave unrestricted access enabled.
4. Copy the driver's `mongodb+srv://...` connection string into backend `MONGODB_URI`, including the database name, for example `...mongodb.net/shalinder?retryWrites=true&w=majority`. Percent-encode special characters in credentials.
5. Run the first-admin command and explicit seed. Mongoose creates indexes for unique slugs, section keys, staff email, listing types/dates, timeline order and activity dates. On larger deployments manage index creation as a release step.

Atlas connectivity, credentials, IP allowlisting, backups and production performance need verification with your actual account.

## Staff authentication and permissions

- Passwords use per-user random salts with Node's scrypt. There are no production default accounts/passwords or public signup endpoints.
- Server-side sessions are stored in MongoDB with an 8-hour cookie/TTL. Cookies are HttpOnly, SameSite=Lax, Secure in production. Login regenerates the session; logout destroys it. Disabling or changing a staff role, or using the password-reset command, invalidates existing sessions through a version counter.
- CSRF tokens are bound to sessions and required for all writes including login. The request Origin must exactly match `FRONTEND_ORIGIN`. CORS credentials are enabled only for that configured origin. Login is rate-limited per IP.
- Editors can create/edit drafts, preview, upload images and edit image descriptions. Administrators additionally publish/unpublish/trash/restore, delete unused images and manage users. There is no separate publisher role; publishing is an administrator permission.
- Staff cannot change their own access through the user-management API, preventing accidental sole-admin lockout. Use a second administrator for access changes.
- No email reset is advertised or implemented. SMTP is not configured or tested. For a safe administrative reset, an authorized operator runs `npm.cmd run reset-password` in `server`, verifies the person's identity separately, enters their email and a new hidden password, then shares it securely. Existing sessions are revoked; a disabled account stays disabled.

## Editorial workflow

1. Sign in and open **Posts → Create post**. Choose English/Hindi and article/news/video. Fill title, unique slug, excerpt, public author, category and optional tags/SEO.
2. Write the body. Use Bold/Italic/Heading/list controls, HTTPS links and **Inline image**. Paste inserts plain text; formatting and image URLs are sanitized on save.
3. Choose or upload a cover. Use a genuine JPEG/PNG/WebP under 10 MB and 40 megapixels. Images are re-encoded as WebP, stripped of source metadata and limited to 2400×2400 without enlargement. Video posts use a thumbnail cover plus an allowlisted embed URL:
   - `https://www.youtube-nocookie.com/embed/VIDEO_ID` (11-character ID)
   - `https://player.vimeo.com/video/NUMERIC_ID`
4. **Save draft** persists the working copy. **Preview saved draft** opens a staff-only preview. Unsaved values remain on failed requests; browser/navigation warnings help prevent losing edits. Conflicting saves return an error rather than overwriting another editor's work.
5. Ask an administrator to review and **publish**. Editing an already published item changes only its draft. Publication copies the saved draft to the public snapshot. Unpublish removes the snapshot. Trash also unpublishes; Restore returns a draft and does not silently republish.
6. Use **Pages & homepage** or **Website settings** for existing fields. Choose English/Hindi before editing. Use **Journey** to add entries and assign their display order; publish each new entry.
7. To replace an image, upload a **new** image and select it only in the desired fields. Other content retains the original. The library lists live usage across drafts, published content and trash. Referenced images cannot be deleted; remove/replace all those references first. Trashed content retains draft references intentionally.

Use category names from the mapping table for topic-specific strips. All types appear in `/posts`; articles appear on the homepage/thought leadership page, news in the nation-building feed, and videos in the video strips. Nothing is fabricated when the database is empty/unavailable. The three old homepage article titles are migrated as **drafts** because they had no article bodies.

The legacy public contact/question forms and several pre-existing FAQ/press controls were already placeholders. This CMS edits their content; it does not implement a visitor inbox, email delivery or chatbot. Those existing non-CMS workflows need a separate product decision before treating them as live services.

## Storage, serving and publication

- `UPLOAD_DIR` must not be inside the repository, frontend source or build. The server refuses such configuration at startup. Never expose this directory using a static web-server alias.
- Files use server-generated UUID names and a fixed WebP extension. Uploaded filenames never become filesystem paths. Only image decoding results are saved; executable/SVG/GIF/video uploads are rejected. Failed database insertions remove the corresponding newly written file.
- `/api/media/:id` checks whether a current published, non-trashed snapshot references the image. Otherwise only valid active staff sessions can access it. Responses use `nosniff` and `private, no-store`. Metadata/usage listings are staff-only. An image referenced anywhere publicly is public, even if also used in a draft. Previously public bytes downloaded by a visitor cannot be recalled.
- Public APIs never return working drafts, trashed items, staff records or session/password data. They and media use `no-store`; public React views refresh on navigation, focus and a 15-second interval. An already-open tab may show the previous render until its next refresh. Do not add a CDN cache to `/api`.
- **Direct video upload is intentionally disabled.** The supported free-storage flow is YouTube/Vimeo embeds and optimized thumbnail images. Enabling video upload later requires stream/range handling, an allowlist/signature check, a strict size cap and documented disk/bandwidth capacity; it is not a hidden unlimited upload option.

## Deployment requirements (not performed)

Use one continuously running Node 22.12+ backend instance, MongoDB Atlas and a durable upload volume. The current management-write gate serializes writes in that Node process to prevent publication/deletion races. **Do not run multiple backend writers/cluster workers against the same database without adding distributed locking or transactional reference accounting**, and replace the in-process login limiter with a shared store before horizontal scaling.

Terminate HTTPS at a trusted reverse proxy. Set `NODE_ENV=production`, a strong `SESSION_SECRET`, the exact HTTPS `FRONTEND_ORIGIN`, and persistent `UPLOAD_DIR`. The backend trusts exactly one proxy hop; restrict direct access to Node and have the proxy replace forwarded headers. Serve frontend assets and proxy `/api/*` to Node under the same public origin. SPA routes, including `/admin/*`, `/posts/*` and the Hindi route, must fall back to frontend `index.html`; `/api/*` must never fall back to HTML. Set proxy request limits slightly above the 10 MB image limit and reasonable timeouts. Never cache management, auth or controlled-media responses. Run the Node process under a dedicated account with service restart/log rotation.

Build without overwriting the supplied build directory during local verification:

```powershell
Set-Location C:\Users\91975\Shalinderweb
npm.cmd run lint
npm.cmd run build -- --outDir .cms-build
Set-Location server
npm.cmd test
npm.cmd audit
# Production install/start, on the intended host after configuring environment:
npm.cmd ci --omit=dev
npm.cmd start
```

The test suite starts an isolated MongoDB test process and never uses `MONGODB_URI`/Atlas. Its first run may download a MongoDB binary. It writes only QA artifacts to `.cms-test-data`; these are ignored by Git. `server/test-ui.mjs` is an explicit, disposable browser-QA fixture using generated test credentials and an isolated database; never run it as the production service.

## Backup and restore

Back up **MongoDB and the upload directory together**. Database-only backups do not contain image bytes. Use Atlas snapshots/PITR if available on your existing plan; do not assume a paid feature is enabled. MongoDB Database Tools provide `mongodump`/`mongorestore` for a manual alternative.

For a consistent manual backup, stop CMS writes/the backend, take the database dump, copy the upload directory, then restart. Use a protected backup directory outside the repository, encryption at rest, limited access, retention and a second failure domain. Read credentials interactively rather than adding passwords to shell history:

```powershell
# Requires MongoDB Database Tools installed. Enter the URI through Read-Host.
$cmsBackupUri = Read-Host 'MongoDB URI for backup'
$cmsBackupRoot = 'D:\ShalinderBackups\2026-10-14'
New-Item -ItemType Directory -Force $cmsBackupRoot
mongodump --uri=$cmsBackupUri --archive="$cmsBackupRoot\database.archive.gz" --gzip
Copy-Item -LiteralPath 'C:\shalinder-data\uploads' -Destination "$cmsBackupRoot\uploads" -Recurse
Remove-Variable cmsBackupUri
```

Restore first to a **new isolated database and empty upload directory**, never overwrite a live environment casually:

```powershell
$cmsRestoreUri = Read-Host 'URI of isolated restore database'
mongorestore --uri=$cmsRestoreUri --archive='D:\ShalinderBackups\2026-10-14\database.archive.gz' --gzip --nsFrom='shalinder.*' --nsTo='shalinder_restore.*'
Copy-Item -LiteralPath 'D:\ShalinderBackups\2026-10-14\uploads' -Destination 'C:\shalinder-restore\uploads' -Recurse
Remove-Variable cmsRestoreUri
```

Point an isolated backend at that restored database/directory, use a new session secret, confirm login, published pages, draft privacy and representative images, then plan cutover. Verify both backup exit codes and periodically test restoration. Session data may be excluded from backup; always invalidate sessions during recovery. Do not run seed as a restore procedure.

## Verification and remaining operational work

- Production frontend build succeeds in `.cms-build`.
- Integration tests cover unauthenticated writes, CSRF/roles, duplicate slugs, protected previews, save/publish/unpublish/trash/restore, stale revisions, rich-text sanitization, private images, fake/oversized uploads, referenced-image deletion blocking, replacement isolation, app/database-client restart persistence, idempotent seed, page publication and account disabling/logout.
- Backend dependency audit after the Sharp update: **0 known vulnerabilities**.
- Local lint completes with no errors; one pre-existing navbar state-in-effect advisory remains. See [CMS-VERIFICATION.md](./CMS-VERIFICATION.md) for integration and browser results.
- Atlas, SMTP and production infrastructure have not been tested. Configure Atlas and persistent storage, run first-admin/seed, review editorial content and translations, and verify HTTPS/proxy behavior before launch.
