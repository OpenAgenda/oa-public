'use strict';

const fs = require('fs');
const { promisify } = require('util');
const _ = require('lodash');
const knex = require('knex');
const mysql = require('mysql');

function _sql(SQLDataRelativePath) {
  const k = knex({ client: 'mysql' });

  const raw = [
    fs.readFileSync(`${__dirname}/reset.sql`, 'utf-8'),
    fs.readFileSync(`${__dirname}/../../model.sql`, 'utf-8'),
    fs.readFileSync(`${__dirname}/${SQLDataRelativePath}`, 'utf-8')
  ];

  return raw.join('\n');
}

async function _load(dbConfig, SQLDataRelativePath) {
  const con = mysql.createConnection({
    multipleStatements: true,
    ...dbConfig,
  });

  const query = promisify(con.query.bind(con));

  await query(_sql(SQLDataRelativePath));

  con.end();
}

module.exports = (dbConfig, SQLDataRelativePath = 'ardeche/rows.sql') => {
  const client = knex({
    client: 'mysql',
    connection: dbConfig
  });

  return {
    destroyClient: () => client.destroy(),
    client,
    load: () => _load(dbConfig, SQLDataRelativePath)
  };
};
