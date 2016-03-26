"use strict";

const knexLib = require( 'knex' ),

w = require( 'when' );

var knex,

config,

schemas,

transferEvent = require( './transferEvent' ),

dbUtils = require( './dbUtils' ),

logger = require( 'basic-logger' );

module.exports = agenda;

module.exports.init = init;

function agenda( agendaId ) {

  if ( !config ) {

    throw 'service not initialized';

  }

  return {
    transferEvent: transferEvent( agendaId )
  }

}

function init( c ) {

  schemas = c.schemas;

  knex = knexLib( {
    client: 'mysql',
    connection: c.mysql
  } );

  config = c;

  transferEvent.init( {
    knex: knex,
    schemas: schemas
  } );

  dbUtils.init( {
    knex: knex,
    schemas: schemas
  } );

  if ( c.logger ) {

    logger.setLogger( c.logger );
    
  }

}