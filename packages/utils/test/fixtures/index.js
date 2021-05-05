'use strict';

const fs = require('fs');
const { promisify } = require('util');
const _ = require('lodash');
const knex = require('knex');
const mysql = require('mysql');

const reset = `
  drop database if exists {database};
  create database if not exists {database};
  use {database};
`;

function _sql(database, SQLDataRelativePath) {
  const raw = [
    reset.replace(/{database}/g, database),
    fs.readFileSync(`${__dirname}/${SQLDataRelativePath}`, 'utf-8'),
  ];

  return raw.join('\n');
}

async function _load(dbConfig, SQLDataRelativePath) {
  const con = mysql.createConnection({
    multipleStatements: true,
    ..._.omit(dbConfig, ['database'])
  });

  const query = promisify(con.query.bind(con));

  await query(_sql(dbConfig.database, SQLDataRelativePath));

  con.end();
}

module.exports = dbConfig => {
  const client = knex({
    client: 'mysql',
    connection: dbConfig,
  });

  return {
    destroyClient: () => client.destroy(),
    client,
    load: SQLDataRelativePath => _load(dbConfig, SQLDataRelativePath)
  };
};
