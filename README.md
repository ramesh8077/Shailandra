# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
# Custom CMS

See [CMS-HANDOVER.md](./CMS-HANDOVER.md) for the implemented CMS, content inventory, Windows setup, Atlas configuration, staff setup, editorial guide, tests and backup/deployment requirements. Frontend and backend environment templates are separate. No production deployment has been performed.

## Backend-independent public site

The regular `npm run build` command builds the live-CMS-compatible frontend into `dist/`. The public pages keep bundled defaults and use a successfully loaded static snapshot if one is present; published posts can use the snapshot when the CMS API is unavailable. Admin routes continue to require the authenticated backend.

To export the latest published CMS content and build a standalone static site, first configure `server/.env` with `MONGODB_URI`, `SESSION_SECRET` (at least 32 characters), and `UPLOAD_DIR` (optional; defaults to `C:\shalinder-data\uploads`). Then run from the repository root:

```powershell
npm.cmd run export:static
```

The command reads published CMS records and referenced media, validates them, then creates a new timestamped directory under `exports/`. It never writes to MongoDB and refuses to overwrite an existing export or `dist/`. To choose the output directory, provide a new path inside `exports/`:

```powershell
npm.cmd run export:static -- --out-dir exports\shalinder-static-review
```

The export connects to the database configured by `MONGODB_URI`; do not run it against production until the data owner explicitly approves. It exports published pages/settings, journey entries, posts, language variants, and referenced WebP images. Drafts, trashed items, users, and session data are excluded. Successful output includes `index.html`, `content-snapshot.json`, local `site-assets/`, and `.htaccess`.

Preview an exported directory without copying it into `dist/`:

```powershell
npx.cmd vite preview --outDir exports\shalinder-static-review --host 127.0.0.1
```

For Hostinger, make a backup of the current `public_html` first, then upload the **contents** of the validated export directory (including `.htaccess`) to the document root. Do not upload it as a nested folder. Verify the homepage, a post detail URL, local images, and a browser refresh on nested routes before switching visitors to it. Deployment is manual; this command does not contact Hostinger.

After CMS changes, create a fresh export and deploy that folder to publish the changes in static mode. A static site continues to display its exported public content and images if Express, MongoDB, or the admin panel is unavailable. CMS login, editing, uploads, publishing, and staff management still require the backend. Back up MongoDB and `UPLOAD_DIR` separately and together; see [CMS-HANDOVER.md](./CMS-HANDOVER.md#backup-and-restore).
