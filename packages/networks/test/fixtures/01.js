"use strict";

const fs = require( 'fs' );
const knex = require( 'knex' )( { client: 'mysql' } );

const raw = [
  fs.readFileSync( __dirname + '/reset.sql', 'utf-8' ),
  fs.readFileSync( __dirname + '/../../model.sql', 'utf-8' ).replace( '${schema}', 'network' )
];

raw.push( knex( 'network' ).insert( [ {
  uid: 1,
  form_schema_id: 2,
  updated_at: new Date( '1981-02-28T03:00:00.000Z' ),
  created_at: new Date( '1981-02-28T03:00:00.000Z' ),
  title: 'Métropole de Toulouse'
}, {
  uid: 13,
  form_schema_id: 12,
  updated_at: new Date( '1981-02-28T03:00:00.000Z' ),
  created_at: new Date( '1981-02-28T03:00:00.000Z' ),
  title: 'Métropole de Lille'
} ] ) );

module.exports = raw.join( '\n' );
