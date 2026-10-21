import mongoose from 'mongoose';
import { createInterface } from 'node:readline/promises';
import { configFromEnv } from './config.js';
import { User } from './models.js';
import { credentials } from './validation.js';
import { hashPassword } from './security.js';
import { seed } from './seed.js';
const config = configFromEnv();
async function passwordPrompt() {
  if (!process.stdin.isTTY) throw new Error('Use an interactive terminal for the hidden password prompt');
  process.stdout.write('Password (12+ characters, hidden): ');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  return new Promise((resolve, reject) => {
    let value = '';
    const onData = chunk => {
      for (const c of chunk) {
        if (c === '\u0003') {
          finish();
          reject(new Error('Cancelled'));
          return;
        }
        if (c === '\r' || c === '\n') {
          finish();
          resolve(value);
          return;
        }
        if (c === '\u007f' || c === '\b') value = value.slice(0, -1);else value += c;
      }
    };
    function finish() {
      process.stdin.off('data', onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write('\n');
    }
    process.stdin.on('data', onData);
  });
}
try {
  await mongoose.connect(config.mongoUri);
  await User.init();
  const command = process.argv[2];
  if (command === 'seed') await seed(config);else if (['admin', 'reset'].includes(command)) {
    if (command === 'admin' && (await User.exists({
      role: 'administrator'
    }))) throw new Error('An administrator already exists. Use the admin UI to add staff.');
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    const email = await rl.question('Staff email: ');
    const name = command === 'admin' ? await rl.question('Display name: ') : '';
    rl.close();
    const password = await passwordPrompt();
    const input = credentials.parse({
      email,
      password
    });
    const passwordHash = await hashPassword(input.password);
    if (command === 'admin') {
      if (!name.trim()) throw new Error('Name is required');
      await User.create({
        email: input.email,
        name: name.trim(),
        passwordHash,
        role: 'administrator'
      });
      console.log('First administrator created.');
    } else {
      const user = await User.findOneAndUpdate({
        email: input.email
      }, {
        $set: {
          passwordHash
        },
        $inc: {
          sessionVersion: 1
        }
      });
      if (!user) throw new Error('No staff user with that email');
      console.log('Password reset. All previous sessions revoked. Account enablement unchanged.');
    }
  } else throw new Error('Use admin, reset, or seed');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
