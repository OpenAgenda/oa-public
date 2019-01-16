"use strict";

const fs = require( 'fs' );
const knex = require( 'knex' )( { client: 'mysql' } );

const rawSQL = [
  'reset.sql'
].map( fx => fs.readFileSync( __dirname + '/sql/' + fx, 'utf-8' ).replace( /;(\n|)$/, '' ) );

const redisKeyContents = {
  '789' : JSON.stringify( { ev: [], l: [] } )
};

module.exports = {
  sql: rawSQL.join( ';\n' ) + ';',
  redisKeyContents
}
