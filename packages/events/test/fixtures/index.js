import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { promisify } from 'node:util';
import _ from 'lodash';
import knex from 'knex';
import mysql from 'mysql2';

import creditsEventCreate from './creditsEventCreate.json';
import creditsEventUpdate from './creditsEventUpdate.json';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function _sql(schema, SQLDataRelativePath) {
  const raw = [
    fs.readFileSync(`${__dirname}/reset.sql`, 'utf-8'),
    fs.readFileSync(`${__dirname}/../../model.sql`, 'utf-8').replace(
      // eslint-disable-next-line no-template-curly-in-string
      '${schema}',
      schema,
    ),
    fs
      .readFileSync(`${__dirname}/mel.sql`, 'utf-8')
      .replace(/\$\{schema\}/g, schema),
  ];

  if (SQLDataRelativePath) {
    raw.push(fs.readFileSync(`${__dirname}/${SQLDataRelativePath}`, 'utf-8'));
  }

  return raw.join('\n');
}

async function _load(dbConfig, schema, SQLDataRelativePath) {
  const con = mysql.createConnection({
    multipleStatements: true,
    ..._.omit(dbConfig, ['database']),
  });

  const query = promisify(con.query.bind(con));
  await query(_sql(schema, SQLDataRelativePath));

  con.end();
}

const createClient = (dbConfig, SQLDataRelativePath) => {
  const client = knex({
    client: 'mysql2',
    connection: { ...dbConfig },
  });

  return {
    destroyClient: () => client.destroy(),
    client,
    load: () => _load(dbConfig, SQLDataRelativePath),
  };
};

export default Object.assign(createClient, {
  creditsEventCreate,
  creditsEventUpdate,
});
