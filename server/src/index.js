import { configFromEnv } from './config.js';
import { createApp } from './app.js';
import { initializeDatabase } from './sqliteStore.js';
import { User } from './models.js';
import { hashPassword } from './security.js';
import { credentials } from './validation.js';
import { seed } from './seed.js';
import { importInitialBlogPosts } from './initialBlogPosts.js';

const config = configFromEnv();

// Initialize SQLite database (always succeeds, no MySQL required)
const dbPath = process.env.SQLITE_DB_PATH || undefined;
initializeDatabase(dbPath);
console.log('SQLite database initialized successfully');

const app = createApp(config);
const port = Number(process.env.PORT || 4000);
const server = app.listen(port, () => console.log('Website server listening on port', port));

// Run optional initialization
(async () => {
  try {
    if (process.env.SEED_DEFAULT_CONTENT === 'true') await seed(config);
    const importedBlogs = await importInitialBlogPosts();
    if (importedBlogs) console.log(`Imported ${importedBlogs} initial blog posts into CMS`);

    const bootstrapEmail = process.env.INITIAL_ADMIN_EMAIL?.trim();
    const bootstrapName = process.env.INITIAL_ADMIN_NAME?.trim();
    const bootstrapPassword = process.env.INITIAL_ADMIN_PASSWORD;
    if (bootstrapEmail && bootstrapName && bootstrapPassword && !(await User.exists({ role: 'administrator' }))) {
      const input = credentials.parse({ email: bootstrapEmail, password: bootstrapPassword });
      await User.create({
        email: input.email,
        name: bootstrapName,
        passwordHash: await hashPassword(input.password),
        role: 'administrator'
      });
      console.log(`Initial CMS administrator created for ${input.email}.`);
    }
  } catch (setupError) {
    console.error(`Optional CMS initialization failed: ${setupError.message}`);
  }
})();

async function shutdown() {
  await new Promise(resolve => server.close(resolve));
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
