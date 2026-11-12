import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Hostinger generates the Node.js routing rules for the live public_html.
// Do not ship the static-only rule that rewrites /api requests to index.html.
const staticRewriteFile = fileURLToPath(new URL('../dist/.htaccess', import.meta.url));
await rm(staticRewriteFile, { force: true });
