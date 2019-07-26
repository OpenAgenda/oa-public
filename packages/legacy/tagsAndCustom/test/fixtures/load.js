"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const mysql = require( 'mysql' );
const { promisify } = require( 'util' );

module.exports = async ( config, fixtures ) => {

  const con = mysql.createConnection( {
    user: config.mysql.user,
    password: config.mysql.password,
    multipleStatements: true
  } );

  const { sql } = fixtures;

  await promisify( con.query.bind( con ) )( sql.replace( /\{database\}/g, config.mysql.database ) );

  con.end();

}
