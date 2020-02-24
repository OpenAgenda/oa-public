'use strict';

const _ = require('lodash');
const mysql = require('mysql');
const { promisify } = require('util');

module.exports = async (config, jsFile) => {
  const sql = require('./' + jsFile);

  const con = mysql.createConnection(Object.assign(_.pick(config, ['user', 'password']), {
    multipleStatements: true
  }));

  const query = promisify(con.query.bind(con));

  const result = await query(sql);

  con.end();
}
