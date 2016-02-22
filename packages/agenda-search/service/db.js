"use strict";

var knexLib = require( 'knex' ),

utils = require( 'utils' ),

knex,

agendaSchema;

module.exports = init;

utils.extend( module.exports, {
  init: init,
  list: list
} );

function list( offset, limit, cb ) {

  if ( !knex ) return cb( 'no config' );

  knex.transaction( trx => {

    return trx
    .select( 'id', 'uid', 'slug', 'title', 'description', 'image', 'updated_at' )
    .from( agendaSchema )
    .limit( limit )
    .offset( offset );

  } )

  .then( result => cb( null, result ), cb );

}

function init( cfg ) {

  agendaSchema = cfg.schemas.agenda;

  knex = knexLib( {
    client: 'mysql',
    connection: cfg.mysql
  } );

}
