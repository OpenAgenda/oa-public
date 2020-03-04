'use strict';

const _ = require('lodash');
const fs = require('fs');
const mysql = require('mysql');
const { promisify } = require('util');

module.exports = async (config, sql) => {
  const getCon = (omitDB = false) => mysql.createConnection({
    ..._.omit(config, omitDB ? ['database'] : []),
    multipleStatements: true
  });

  const con = getCon(true);

  const compiledSQL = sql.map(fx => fs.readFileSync(
    __dirname + '/' + fx, 'utf-8'
  ).replace(/;(\n|)$/, '')).join(';\n') + ';'

  await promisify(con.query.bind(con))(compiledSQL);

  con.end();

  const query = async (sql, values) => {
    const con = getCon();
    await promisify(con.query.bind(con))(sql, values);
    con.end();
  }

  return {
    query
  }
}
