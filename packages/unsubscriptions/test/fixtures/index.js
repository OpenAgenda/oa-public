import fs from 'node:fs/promises';
import { promisify } from 'node:util';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2';
import knex from 'knex';

import unsubscriptionLinks from './unsubscriptionLinks.js';
import unsubscribed from './unsubscribed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function fixtures(dbConfig) {
  const k = knex({
    client: 'mysql2',
    connection: {
      ...dbConfig,
      database: 'unsubscription_test',
    },
  });

  const con = mysql.createConnection({
    user: dbConfig.user,
    password: dbConfig.password,
    ssl: dbConfig.ssl,
    multipleStatements: true,
  });

  const raw = [];

  raw.push(
    await fs.readFile(`${__dirname}/reset.sql`, 'utf-8'),
    await fs.readFile(`${__dirname}/model.sql`, 'utf-8'),
    `${k('unsubscription_link').insert(unsubscriptionLinks)};`,
    `${k('unsubscribed').insert(unsubscribed)};`,
  );

  await promisify(con.query.bind(con))(raw.join('\n'));

  con.end();

  return k;
}
