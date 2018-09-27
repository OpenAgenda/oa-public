'use strict';

const { promisify } = require( 'util' );
const mysql = require( 'mysql' );
const testconfig = require( '../testconfig' );

module.exports = async database => {
  const { user, password } = testconfig.mysql;
  const conn = mysql.createConnection( { user, password } );

  await promisify( conn.query ).call( conn, `DROP DATABASE IF EXISTS ${database}` );
  await promisify( conn.query ).call( conn, `CREATE DATABASE IF NOT EXISTS ${database}` );

  conn.destroy();
};
