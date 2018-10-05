import _ from 'lodash';
import { readFile } from 'fs';
import { promisify } from 'util';
import mysql from 'mysql';

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

    await promisify( conn.query ).call( conn, sql.replace( /\${schema}/g, schema ) );
  }

  conn.destroy();
}

function getConfig( config, database, key = 'mysql.database' ) {
  const newConfig = _.cloneDeep( config );

  _.set( newConfig, key, database );

  return newConfig;
}

module.exports = {
  create,
  fixtures,
  getConfig
};
