'use strict';

const fs = require('node:fs');
const { promisify } = require('node:util');
const _ = require('lodash');
const knex = require('knex');
const mysql = require('mysql2');

function _sql(SQLDataRelativePath) {
  const raw = [
    fs.readFileSync(`${__dirname}/reset.sql`, 'utf-8'),
    fs.readFileSync(`${__dirname}/../../model.sql`, 'utf-8'),
    fs.readFileSync(`${__dirname}/${SQLDataRelativePath}`, 'utf-8'),
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

module.exports = (dbConfig, SQLDataRelativePath = 'ardeche/rows.sql') => {
  const client = knex({
    client: 'mysql2',
    connection: dbConfig,
  });

  return {
    destroyClient: () => client.destroy(),
    client,
    load: () => _load(dbConfig, SQLDataRelativePath),
  };
};
