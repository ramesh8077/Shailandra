import path from 'node:path';

export async function buildStaticSite({
  root,
  publicDir,
  outDir
}) {
  if (!root || !publicDir || !outDir) {
    throw new Error('Project root, static data directory and output directory are required');
  }
  const { build } = await import('vite');
  const originalCwd = process.cwd();
  process.env.VITE_CONTENT_SOURCE = 'static';
  process.env.VITE_API_BASE = '';
  process.chdir(root);
  try {
    await build({
      root,
      configFile: path.join(root, 'vite.config.js'),
      mode: 'static',
      publicDir,
      base: '/',
      define: {
        'import.meta.env.VITE_CONTENT_SOURCE': JSON.stringify('static'),
        'import.meta.env.VITE_API_BASE': JSON.stringify('')
      },
      build: {
        outDir,
        emptyOutDir: true
      }
    });
  } finally {
    process.chdir(originalCwd);
  }
}
