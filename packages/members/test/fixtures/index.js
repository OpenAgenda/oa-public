"use strict";

const fs = require( 'fs' );
const knex = require( 'knex' )( { client: 'mysql' } );

const raw = [
  fs.readFileSync( __dirname + '/reset.sql', 'utf-8' ),
  fs.readFileSync( __dirname + '/../../model.sql', 'utf-8' ).replace( '${schema}', 'member' )
];

const members= require( './members.json' );

raw.push( knex( 'member' ).insert( members ) );

module.exports = raw.join( '\n' );
