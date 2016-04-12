"use strict";

const knexLib = require( 'knex' ),

w = require( 'when' );

var knex,

config,

schemas,

transferEvent = require( './transferEvent' ),

dbUtils = require( './dbUtils' ),

utils = require( 'utils' ),

getters = require( './getters' ),

logger = require( 'basic-logger' ),

settings = require( './settings' );

module.exports = agenda;

module.exports.init = init;

function agenda( agendaId ) {

  if ( !config ) {

    throw 'service not initialized';

  }

  let get = getters( agendaId ),

  s = settings( agendaId );

  return {

    // set stakeholder requirements
    settings: {
      get: s.get,
      set: s.set
    },

    // get a stakeholder of an agenda
    get: get,

    // list stakeholders of an agenda
    list: get.list,

    // transfer an event from one stakeholder to another
    transferEvent: transferEvent( agendaId )
    
  }  

}


function init( c, cb ) {

  schemas = c.schemas;

  config = c;

  w( c )

  .then( () => {

    if ( c.logger ) {

      logger.setLogger( c.logger );
      
    }

  } )

  .then( () => {

    knex = knexLib( {
      client: 'mysql',
      connection: c.mysql
    } );

  } )  

  .then( () => {

    transferEvent.init( {
      knex: knex,
      schemas: schemas
    } );

  } )

  .then( () => {

    getters.init( {
      knex: knex,
      schemas: schemas
    } );

  } )

  .then( () => {

    dbUtils.init( {
      knex: knex,
      schemas: schemas
    } );

  } )

  .then( () => {

    return settings.init( {
      mysql: c.mysql,
      knex: knex,
      schemas: schemas
    } );

  } )

  .done( () => cb(), cb );

}