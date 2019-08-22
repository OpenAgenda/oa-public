'use strict';

const fs = require('fs');
const { promisify } = require('util');
const _ = require('lodash');
const knex = require('knex');
const mysql = require('mysql');

const members = require('./members.json');

function _sql() {
  const k = knex({ client: 'mysql' });

  const raw = [
    fs.readFileSync(`${__dirname}/reset.sql`, 'utf-8'),
    fs
      .readFileSync(`${__dirname}/../../model.sql`, 'utf-8')
      // eslint-disable-next-line no-template-curly-in-string
      .replace('${schema}', 'member')
  ];

  raw.push(k('member').insert(members));

  return raw.join('\n');
}

async function _load(dbConfig) {
  const con = mysql.createConnection({
    ..._.pick(dbConfig, ['user', 'password']),
    multipleStatements: true
  });

  const query = promisify(con.query.bind(con));

  await query(_sql());

  con.end();
}

module.exports = dbConfig => {
  const client = knex({
    client: 'mysql',
    connection: {
      ...dbConfig,
      database: 'memberstest'
    }
  });

  return {
    destroyClient: () => client.destroy(),
    client,
    load: () => _load(dbConfig)
  };
};
