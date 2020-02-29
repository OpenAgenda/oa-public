'use strict';

const _ = require('lodash');
const fs = require('fs');
const mysql = require('mysql');
const { promisify } = require('util');

module.exports = async (config, sql) => {
  const con = mysql.createConnection({
    ..._.omit(config, ['database']),
    multipleStatements: true
  });

  const compiledSQL = sql.map(fx => fs.readFileSync(
    __dirname + '/' + fx, 'utf-8'
  ).replace(/;(\n|)$/, '')).join(';\n') + ';'

  await promisify(con.query.bind(con))(compiledSQL);

  con.end();
}
