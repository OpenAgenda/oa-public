'use strict';

const fs = require('node:fs');
const { promisify } = require('node:util');
const _ = require('lodash');
const mysql = require('mysql');

module.exports = async (config, sql) => {
  const con = mysql.createConnection({
    ..._.omit(config, ['database']),
    multipleStatements: true,
  });

  const compiledSQL = `${sql.map((fx) => fs.readFileSync(`${__dirname}/${fx}`, 'utf-8').replace(/;(\n|)$/, '')).join(';\n')};`;

  await promisify(con.query.bind(con))(compiledSQL);

  con.end();
};
