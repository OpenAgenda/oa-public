"use strict";

const fs = require( 'fs' );
const knex = require( 'knex' )( { client: 'mysql' } );

const rawSQL = [
  'reset.sql'
].map( fx => fs.readFileSync( __dirname + '/sql/' + fx, 'utf-8' ).replace( /;(\n|)$/, '' ) );

const redisKeyContents = {
  '789' : JSON.stringify( { ev: [], l: [] } ),
  '101' : JSON.stringify( { ev: [], l: [ { u: 2, lt: 45, lg: 47 } ] } ),
  '666' : JSON.stringify( { ev: [], l: [ { u: 3, lt: 45, lg: 47 } ] } )
};

module.exports = {
  sql: rawSQL.join( ';\n' ) + ';',
  redisKeyContents
}
