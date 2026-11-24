import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const addonRoot = path.join(serverRoot, 'node_modules', 'better-sqlite3');
const build = spawnSync(npmCommand, ['--prefix', addonRoot, 'run', 'build-release'], {
  cwd: addonRoot,
  env: {
    ...process.env,
    GYP_DEFINES: [process.env.GYP_DEFINES, 'force_build=1'].filter(Boolean).join(' ')
  },
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status || 1);

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
new Database(':memory:').close();
console.log('Host-compatible better-sqlite3 native build verified.');
