import { configFromEnv } from './config.js';
import { createApp } from './app.js';
import { initializeDatabase, pool } from './mysqlStore.js';
import { User } from './models.js';
import { hashPassword } from './security.js';
import { credentials } from './validation.js';
import { seed } from './seed.js';
import { importInitialBlogPosts } from './initialBlogPosts.js';
const config = configFromEnv();
const app = createApp(config);
const port = Number(process.env.PORT || 4000);
const server = app.listen(port, () => console.log('Website server listening on port', port));
let stopping = false;
let wasReady = false;

async function connectDatabase() {
  while (!stopping && !app.locals.dbReady) {
    try {
      await initializeDatabase();
      app.locals.dbReady = true;
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
          console.log(`Initial CMS administrator created for ${input.email}. Remove INITIAL_ADMIN_* values from hosting settings now.`);
        }
      } catch (setupError) {
        console.error(`Optional CMS initialization failed; website remains available. ${setupError.message}`);
      }
      if (!wasReady) console.log('CMS MySQL database is ready');
      wasReady = true;
    } catch (error) {
      app.locals.dbReady = false;
      console.error(`CMS MySQL unavailable; public pages remain online. Retrying in 10 seconds. ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}
connectDatabase();

async function shutdown() {
  stopping = true;
  await new Promise(resolve => server.close(resolve));
  await pool.end();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
