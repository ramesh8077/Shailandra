import mongoose from 'mongoose';
import { configFromEnv } from './config.js';
import { createApp } from './app.js';
import { User, Content, Media, Activity } from './models.js';
const config = configFromEnv();
await mongoose.connect(config.mongoUri);
await Promise.all([User.init(), Content.init(), Media.init(), Activity.init()]);
const app = createApp(config);
const server = app.listen(Number(process.env.PORT || 4000), () => console.log('CMS listening on port', process.env.PORT || 4000));
async function shutdown() {
  server.close();
  await app.locals.sessionStore.close();
  await mongoose.disconnect();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
