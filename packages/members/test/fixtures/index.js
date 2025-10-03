import fs from 'node:fs';
import { promisify } from 'node:util';
import _ from 'lodash';
import knex from 'knex';
import mysql from 'mysql2';
import members from './members.json';

function _sql() {
  const k = knex({ client: 'mysql2' });

  const raw = [
    fs.readFileSync(`${import.meta.dirname}/reset.sql`, 'utf-8'),
    fs
      .readFileSync(`${import.meta.dirname}/../../model.sql`, 'utf-8')
      // eslint-disable-next-line no-template-curly-in-string
      .replace('${schema}', 'member'),
  ];

  raw.push(k('member').insert(members));

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
      database: 'memberstest',
    },
  });

  return {
    destroyClient: () => client.destroy(),
    client,
    load: () => _load(dbConfig),
  };
};
