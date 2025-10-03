import fs from 'node:fs';
import { promisify } from 'node:util';

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import _ from 'lodash';
import knex from 'knex';
import mysql from 'mysql2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function _sql() {
  // const k = knex({ client: 'mysql2' });

  const raw = [
    fs.readFileSync(`${__dirname}/reset.sql`, 'utf-8'),
    fs.readFileSync(`${__dirname}/../../model.sql`, 'utf-8'),
  ];

  // raw.push(k('member').insert(members));

  return raw.join('\n');
}

async function _load(dbConfig) {
  const con = mysql.createConnection({
    ..._.pick(dbConfig, ['user', 'password', 'ssl']),
    multipleStatements: true,
  });

  const query = promisify(con.query.bind(con));

  await query(_sql());

  con.end();
}

export default (dbConfig) => {
  const client = knex({
    client: 'mysql2',
    connection: {
      ...dbConfig,
      database: 'usageCounterTest',
    },
  });

  return {
    destroyClient: () => client.destroy(),
    client,
    load: () => _load(dbConfig),
  };
};
