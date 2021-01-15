'use strict';

const _ = require('lodash');
const fs = require('fs');
const { promisify } = require('util');
const knex = require('knex');
const mysql = require('mysql');

const creditsEventCreate = require('./creditsEventCreate.json');
const creditsEventUpdate = require('./creditsEventUpdate.json');

function _sql(schema, SQLDataRelativePath) {
  const raw = [
    fs.readFileSync(`${__dirname}/reset.sql`, 'utf-8'),
    fs.readFileSync(`${__dirname}/../../model.sql`, 'utf-8').replace('${schema}', schema),
    fs.readFileSync(`${__dirname}/legacy.sql`, 'utf-8'),
    fs.readFileSync(`${__dirname}/mel.sql`, 'utf-8').replace(/\$\{schema\}/g, schema)
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

module.exports = (dbConfig, SQLDataRelativePath) => {
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

module.exports.creditsEventCreate = creditsEventCreate;
module.exports.creditsEventUpdate = creditsEventUpdate;