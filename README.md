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

The React/Vite frontend and Express CMS API now deploy as one Node.js app. Express serves the built frontend and same-origin /api routes. If MySQL is temporarily unavailable, the public React site continues to render from bundled content defaults while CMS API requests return HTTP 503.

## Hostinger build settings

- Root directory: ./
- Framework preset: Other
- Node.js: 22.x (22.12 or newer)
- Build command: npm run build:hostinger
- Output directory: dist
- Entry file: server/src/index.js

Configure the root .env values in the Hostinger app's Environment Variables. Copy the MySQL database name, username and password from Hostinger Databases → Management. Generate a stable session secret with openssl rand -hex 48; keep VITE_API_BASE empty. Set UPLOAD_DIR to a persistent folder outside public_html and hbuilds.

On the first start, you can set SEED_DEFAULT_CONTENT=true and provide INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_NAME, and INITIAL_ADMIN_PASSWORD. The app seeds editable content and creates the first administrator only when none exists. After confirming startup logs, disable seeding and remove the initial admin variables.

See CMS-HANDOVER.md for the content inventory, security notes, editorial workflow, and backups. The MongoDB-era integration suite has not yet been migrated to MySQL.
