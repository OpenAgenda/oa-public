"use strict";

const fs = require( 'fs' );
const knex = require( 'knex' )( { client: 'mysql' } );

const rawSQL = [
  'reset.sql',
  'review.create.sql',
  'review_embed.create.sql',
  'review_embed.sia2018.sql',
].map( fx => fs.readFileSync( __dirname + '/sql/' + fx, 'utf-8' ).replace( /;(\n|)$/, '' ) );

const redisKeyContents = {
  '101112' : JSON.stringify( { ev: [], l: [] } )
};

module.exports = {
  sql: rawSQL.join( ';\n' ) + ';',
  redisKeyContents
}


rawSQL.push( knex( 'review' ).insert( [ {
  id: 13262,
  uid: 83549053,
  title: 'SIA 2018'
} ] ) );
