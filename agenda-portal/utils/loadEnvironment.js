import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const portalDir = process.env.PORTAL_DEV
  ? path.join(import.meta.dirname, '../boot') // when developping agenda-portal lib
  : process.cwd(); // when developping portal using agenda-portal

const envFile = `${portalDir}/.env`;

if (process.env.PORTAL_DIR === undefined) {
  process.env.PORTAL_DIR = portalDir;
}

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
}
