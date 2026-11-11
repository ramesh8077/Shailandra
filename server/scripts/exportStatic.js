import { config as loadDotEnv } from 'dotenv';
import { copyFile, lstat, mkdir, mkdtemp, readdir, readFile, rename, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Content, Media } from '../src/models.js';
import { initializeDatabase, pool } from '../src/mysqlStore.js';
import { createStaticSnapshot } from '../src/staticExport.js';
import { buildStaticSite } from '../src/staticBuild.js';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const serverDir = path.join(root, 'server');
const exportsRoot = path.join(root, 'exports');

function outputArgument() {
  const index = process.argv.indexOf('--out-dir');
  if (index === -1) return null;
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error('Provide a directory after --out-dir');
  if (process.argv.filter(argument => argument === '--out-dir').length > 1) {
    throw new Error('Use --out-dir only once');
  }
  return path.resolve(root, value);
}

function defaultOutputDirectory() {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return path.join(exportsRoot, `shailinder-static-${timestamp}`);
}

function assertSafeOutputPath(outputDir) {
  const relative = path.relative(exportsRoot, outputDir);
  if (!relative || relative === '.' || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Static export output must be a new directory inside ${exportsRoot}`);
  }
  if (path.resolve(outputDir) === path.resolve(root, 'dist')) {
    throw new Error('Static export cannot overwrite the production dist directory');
  }
}

async function verifyBuiltOutput(outputDir, snapshotResult, forbiddenValues) {
  const indexPath = path.join(outputDir, 'index.html');
  const snapshotPath = path.join(outputDir, 'content-snapshot.json');
  const [indexStat, jsonStat] = await Promise.all([lstat(indexPath), lstat(snapshotPath)]);
  if (!indexStat.isFile() || !jsonStat.isFile()) {
    throw new Error('Static build is missing index.html or content-snapshot.json');
  }
  const json = await readFile(snapshotPath, 'utf8');
  const snapshot = JSON.parse(json);
  if (Object.keys(snapshot.sections).length !== snapshotResult.pages ||
      snapshot.journey.length !== snapshotResult.journeyEntries ||
      snapshot.posts.length !== snapshotResult.posts ||
      Object.keys(snapshot.media).length !== snapshotResult.mediaFiles) {
    throw new Error('Built static snapshot counts differ from the validated export');
  }
  for (const media of Object.values(snapshot.media)) {
    const relative = media.src.replace(/^\/+/, '').replace(/\//g, path.sep);
    const assetPath = path.resolve(outputDir, relative);
    if (path.relative(outputDir, assetPath).startsWith(`..${path.sep}`)) {
      throw new Error('Exported media path resolves outside the static build');
    }
    if (!(await lstat(assetPath)).isFile()) throw new Error(`Built media file is missing: ${media.src}`);
  }

  const inspectExtensions = new Set(['.html', '.js', '.css', '.json', '.htaccess']);
  async function inspect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await inspect(entryPath);
      } else if (inspectExtensions.has(path.extname(entry.name).toLowerCase()) || entry.name === '.htaccess') {
        const text = await readFile(entryPath, 'utf8');
        if (/(?:mongodb(?:\+srv)?|mysql):\/\//i.test(text)) {
          throw new Error(`A database connection string was found in ${path.relative(outputDir, entryPath)}`);
        }
        for (const secret of forbiddenValues) {
          if (secret && text.includes(secret)) {
            throw new Error(`A configured secret was found in ${path.relative(outputDir, entryPath)}`);
          }
        }
      }
    }
  }
  await inspect(outputDir);
}

let dataDir;
let buildDir;
let connected = false;
let completed = false;

try {
  loadDotEnv({ path: path.join(serverDir, '.env') });
  const { configFromEnv } = await import('../src/config.js');
  const config = configFromEnv();
  const requestedOutput = outputArgument();
  const outputDir = requestedOutput || defaultOutputDirectory();
  assertSafeOutputPath(outputDir);
  await mkdir(exportsRoot, { recursive: true });
  try {
    await lstat(outputDir);
    throw new Error(`Output directory already exists; refusing to overwrite it: ${outputDir}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  await initializeDatabase();
  connected = true;

  dataDir = await mkdtemp(path.join(os.tmpdir(), 'shailinder-static-data-'));
  const result = await createStaticSnapshot({
    Content,
    Media,
    uploadDir: config.uploadDir,
    dataDir,
    forbiddenValues: [config.database.password, config.secret]
  });
  await copyFile(path.join(root, 'public', '.htaccess'), path.join(dataDir, '.htaccess'));

  buildDir = await mkdtemp(path.join(exportsRoot, '.shailinder-static-build-'));
  await buildStaticSite({
    root,
    publicDir: dataDir,
    outDir: buildDir
  });

  await verifyBuiltOutput(buildDir, result, [config.database.password, config.secret]);
  await rename(buildDir, outputDir);
  buildDir = null;
  completed = true;

  console.log('Static export completed and validated.');
  console.log(`Output: ${path.relative(root, outputDir)}`);
  console.log(`Published pages/settings: ${result.pages}`);
  console.log(`Published journey entries: ${result.journeyEntries}`);
  console.log(`Published posts/news/videos: ${result.posts}`);
  console.log(`Referenced media files: ${result.mediaFiles}`);
  console.log(`Copied media bytes: ${result.mediaBytes}`);
  console.log('Validation errors: 0');
  console.log('The export contains only published content. CMS edits require another export and deployment.');
} catch (error) {
  console.error(`Static export failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (connected) {
    await pool.end().catch(error => {
      console.error(`Could not close the export database connection cleanly: ${error.message}`);
      process.exitCode = 1;
    });
  }
  if (dataDir) {
    await rm(dataDir, { recursive: true, force: true }).catch(error => {
      console.error(`Could not remove temporary export data ${dataDir}: ${error.message}`);
      process.exitCode = 1;
    });
  }
  if (buildDir && !completed) {
    await rm(buildDir, { recursive: true, force: true }).catch(error => {
      console.error(`Could not remove temporary build ${buildDir}: ${error.message}`);
      process.exitCode = 1;
    });
  }
}
