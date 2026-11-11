# Shalinder CMS handover

The React 19 + Vite 8 + Tailwind 3 site is served by the same Express 5 Node.js process as its CMS API. The CMS stores content, staff and sessions in Hostinger MySQL. Uploaded WebP images use a persistent directory outside the deployment folders. The app serves the frontend even while MySQL is unavailable; CMS API calls return 503 until the database recovers.

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
- [server/src/mysqlStore.js](./server/src/mysqlStore.js): MySQL connection, schema initialization and persistent session storage.
- [src/cms/](./src/cms/): separate admin layout/login, database dashboard, content forms, rich text, media picker/library, staff management, public provider, listings and detail routes.
- [src/App.jsx](./src/App.jsx), [src/components/](./src/components/), [src/pages/](./src/pages/): CMS connections, corrected import case and published feeds, preserving existing public styling.
- [vite.config.js](./vite.config.js): development `/api` proxy to port 4000.
- [.env.example](./.env.example), [server/.env.example](./server/.env.example), [.gitignore](./.gitignore): local configuration templates and exclusions.
- [scripts/](./scripts/): one-time source conversion utilities used for this implementation. **Do not rerun these on the already migrated source.** The supported repeatable migration is `npm.cmd run seed` in the backend.

The supplied static `dist` build remains the existing live frontend until a new Hostinger deployment replaces it. No production database was created or deployment performed during this code change.

## Hostinger single-app deployment

The root repository is one Hostinger Node.js application. It builds Vite's frontend to `dist/`, then starts Express from `server/src/index.js`; Express serves both the SPA and `/api`. Keep `VITE_API_BASE` empty so requests use same-origin URLs.

In Hostinger, create the Node.js Web App from the GitHub repository and set:

- Root directory: `./`
- Framework preset: **Other**
- Node.js: **22.x** (22.12 or newer)
- Build command: `npm run build:hostinger`
- Output directory: `dist`
- Entry file: `server/src/index.js`

Set the following environment variables in that one app. Use the complete database name and username shown under Hostinger **Databases → Management**. Set a fresh secret using `openssl rand -hex 48`. Create the upload folder outside `public_html` and `hbuilds`; use the Hostinger account's actual home path.

```env
NODE_ENV=production
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=<Hostinger database name>
DB_USER=<Hostinger database user>
DB_PASSWORD=<Hostinger database password>
DB_CONNECTION_LIMIT=5
SESSION_SECRET=<fresh random 96-character hex value>
FRONTEND_ORIGIN=https://shailendrabhadauria.com
VITE_API_BASE=
UPLOAD_DIR=/home/<Hostinger account>/storage/shalinder-uploads
SEED_DEFAULT_CONTENT=true
INITIAL_ADMIN_EMAIL=<your admin email>
INITIAL_ADMIN_NAME=<your display name>
INITIAL_ADMIN_PASSWORD=<unique password of at least 12 characters>
```

On first start, the app creates the MySQL tables, seeds the site's initial editable content when requested, and creates the first administrator if no administrator exists. After the logs confirm these steps, set `SEED_DEFAULT_CONTENT=false` and remove the `INITIAL_ADMIN_*` values from Hostinger. The initial administrator is created only once. Never put database credentials or secrets in `VITE_*` variables or commit them to GitHub.

If MySQL is offline or unavailable during startup, the Node process still serves the frontend and retries the database connection every 10 seconds. CMS APIs return HTTP 503 until MySQL is ready. A health check is available at `/api/health`. The frontend also starts with bundled content defaults, so a failed API request does not prevent React from rendering.

For local development, configure `server/.env` from `server/.env.example`, start the backend in the `server` folder with `npm run dev`, then start Vite in the repository root with `npm run dev`. Vite proxies `/api` to port 4000.

## Staff authentication and permissions

- Passwords use per-user random salts with Node's scrypt. There are no production default accounts/passwords or public signup endpoints.
- Server-side sessions are stored in the MySQL `cms_sessions` table with an 8-hour cookie expiry. Cookies are HttpOnly, SameSite=Lax, Secure in production. Login regenerates the session; logout destroys it. Disabling or changing a staff role invalidates existing sessions through a version counter.
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

## Deployment requirements

This release uses one Node 22.12+ Hostinger Node.js app. Configure the repository root as the app root, build Vite into `dist`, and use `server/src/index.js` as the entry point. The same Express process serves static frontend files and CMS API routes. A MySQL outage does not prevent the process from serving the public frontend; CMS API endpoints return 503 until the database reconnects.

Keep `UPLOAD_DIR` outside Hostinger's versioned deployment folders and `public_html`, and back up that directory with the database. Use the configured HTTPS `FRONTEND_ORIGIN`, a stable random `SESSION_SECRET`, and Hostinger's database host `127.0.0.1`. The management-write queue assumes one Node process; do not enable multiple writers without adding distributed locking.

## Backup and restore

Back up the Hostinger MySQL database and the `UPLOAD_DIR` image directory together. Use Hostinger's database backup/export tools or phpMyAdmin to export SQL, and copy the upload directory to protected storage. A database backup alone does not include uploaded image bytes. Test restoring both to an isolated database and empty upload folder before using a restore in production.

## Verification and remaining operational work

The MySQL conversion and Hostinger configuration are implemented in source, but no Hostinger database or production account was accessed. I did not run the MongoDB-era integration suite; those tests still need to be migrated before they can validate this MySQL adapter. Before launch, deploy to a staging hostname and verify the homepage, admin sign-in, seeded pages, publishing, image upload, and frontend behavior while MySQL is unavailable.
