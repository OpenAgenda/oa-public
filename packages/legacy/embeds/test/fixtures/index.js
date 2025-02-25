import fs from 'node:fs';
import { promisify } from 'node:util';
import _ from 'lodash';
import knex from 'knex';
import mysql from 'mysql';

function _sql(SQLDataRelativePath) {
  const raw = [
    fs.readFileSync(`${import.meta.dirname}/${SQLDataRelativePath}`, 'utf-8'),
  ];

  return raw.join('\n');
}

async function _load(dbConfig, SQLDataRelativePath) {
  const con = mysql.createConnection({
    multipleStatements: true,
    ..._.omit(dbConfig, ['database']),
  });

  const query = promisify(con.query.bind(con));

  await query(_sql(SQLDataRelativePath));

  con.end();
}

export default (dbConfig, SQLDataRelativePath = 'toulouseAndSalon.sql') => {
  const client = knex({
    client: 'mysql',
    connection: dbConfig,
  });

  return {
    destroyClient: () => client.destroy(),
    client,
    load: () => _load(dbConfig, SQLDataRelativePath),
  };
};
