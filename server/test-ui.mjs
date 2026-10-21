// Explicit local QA fixture. Uses an isolated temporary MongoDB and generated credentials.
import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {randomBytes} from 'node:crypto';
import {writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {createApp} from './src/app.js';
import {User} from './src/models.js';
import {hashPassword} from './src/security.js';
import {seed} from './src/seed.js';
process.env.MONGOMS_DOWNLOAD_DIR=path.resolve('../.cms-test-data/mongodb');
const mongo=await MongoMemoryServer.create();
await mongoose.connect(mongo.getUri('cms-ui-fixture'));
const password=randomBytes(24).toString('base64url');
const config={mongoUri:mongo.getUri('cms-ui-fixture'),secret:randomBytes(32).toString('hex'),origin:'http://localhost:5173',uploadDir:path.resolve('../.cms-test-data/ui-uploads'),production:false};
await seed(config);
await User.create({name:'QA administrator',email:'qa@example.test',passwordHash:await hashPassword(password),role:'administrator'});
await mkdir('../.cms-test-data',{recursive:true});await writeFile('../.cms-test-data/ui-credentials.json',JSON.stringify({email:'qa@example.test',password}));
const app=createApp(config);const server=app.listen(4000,'127.0.0.1',()=>console.log('Isolated UI fixture ready at 127.0.0.1:4000'));
async function stop(){server.close();await app.locals.sessionStore.close();await mongoose.disconnect();await mongo.stop();process.exit();}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
