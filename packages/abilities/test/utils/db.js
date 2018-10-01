'use strict';

const _ = require( 'lodash' );
const { readFile } = require( 'fs' );
const { promisify } = require( 'util' );
const mysql = require( 'mysql' );

async function create( config ) {
  const conn = mysql.createConnection( _.pick( config, [ 'user', 'password' ] ) );

  await promisify( conn.query ).call( conn, `DROP DATABASE IF EXISTS ${config.database}` );
  await promisify( conn.query ).call( conn, `CREATE DATABASE IF NOT EXISTS ${config.database}` );

  conn.destroy();
}

async function fixtures( config, schemas ) {
  const conn = mysql.createConnection( {
    multipleStatements: true,
    ..._.pick( config, [ 'user', 'password', 'database' ] )
  } );

  for ( const [ schema, path ] of Object.entries( schemas ) ) {
    const sql = await promisify( readFile )( path, { encoding: 'utf8' } );

    await promisify( conn.query ).call( conn, sql.replace( /\${schema}/g, schema )  );
  }

  conn.destroy();
}

module.exports = {
  create,
  fixtures
};
