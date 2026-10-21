# CMS verification — 14 October 2026

Verified locally with Node.js 22.15.0, the existing Vite 8 frontend, an isolated MongoDB process and generated QA credentials. No Atlas, SMTP, production host or external publishing was used.

| Check | Result |
| --- | --- |
| `npm.cmd run build -- --outDir .cms-build` | Pass; 58 modules; existing `dist` untouched |
| `npm.cmd run lint` | No errors; one existing navbar state-in-effect advisory remains |
| `npm.cmd test` from `server` | 5 integration test groups pass, 0 failures |
| Backend npm dependency audit | 0 known vulnerabilities after updating Sharp to 0.35.5 |
| All 12 original public routes, including the Hindi route | Rendered successfully in the browser |
| Admin login and database dashboard | Verified against the local database |
| New post creation, save and navigation to saved editor | Verified; fixed stale-route data and an unnecessary unsaved-change prompt |
| Duplicate-slug save failure | Clear conflict message; title and slug remained entered |
| Rich text containing English and Hindi | Saved and retained after reload |
| Cover-image picker and publication | Image loaded on published post detail |
| Inline image selection, save and protected preview | Verified; fixed focus restoration after closing the modal |
| Publish from admin → public homepage and detail | Verified with a QA article |
| 390 px mobile layout | Public homepage and admin editor fit without page-wide horizontal scrolling; admin navigation scrolls within its own strip |

The integration suite uses real HTTP handlers, Mongoose, MongoDB indexes and actual Sharp decoding. It checks authentication/CSRF, editor/admin boundaries, duplicate slugs, save/publish/unpublish/trash/restore, optimistic revisions, rich-text sanitization, private media, oversized and fake uploads, reference-protected deletion, safe replacement, persistent content/files across app and database-client restarts, explicit idempotent seeding, page publication, disabling staff and logout revocation.

The restart test recreates the application and database client against the same running database and upload directory. It does not simulate an Atlas outage, host power failure or a full backup restoration. Browser tests used the isolated fixture and are manual tool-driven checks, not a checked-in Playwright suite.

Before launch: configure Atlas and persistent storage, run first-admin and seed explicitly, review migrated editorial placeholders and Hindi translations, verify the real HTTPS reverse proxy/cookies, and rehearse database-plus-media backup restoration. Run one backend writer instance as described in [CMS-HANDOVER.md](./CMS-HANDOVER.md). Legacy visitor contact/newsletter/chat placeholders are outside the CMS workflow and remain separate work.
