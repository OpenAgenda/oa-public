"use strict";

const knexLib = require( 'knex' ),

w = require( 'when' );

var knex,

config,

schemas,

transferEvent = require( './transferEvent' ),

dbUtils = require( './dbUtils' ),

utils = require( 'utils' ),

instanciate = require( './instanciate' ),

gettersLib = require( './getters' ),

logger = require( 'basic-logger' ),

settings = require( './settings' );

module.exports = agenda;

module.exports.init = init;

module.exports.user = user;

function agenda( agendaId ) {

  if ( !config ) {

    throw 'service not initialized';

  }

  let getters = gettersLib( agendaId ),

  s = settings( agendaId ),

  // exposed part of the service for a specific agenda
  agendaService = {};

  // set stakeholder requirements
  agendaService.settings = { 
    get: s.get,
    set: s.set,
    clear: s.clear,
    custom: {
      validate: s.custom.validate,
      toValues: s.custom.toValues,
      toFields: s.custom.toFields
    }
  };

  // get a stakeholder of an agenda
  agendaService.get = get;

  // list stakeholders of an agenda
  agendaService.list = getters.list;

  // transfer an event from one stakeholder to another
  agendaService.transferEvent = transferEvent( agendaId );

  // instanciation function for agenda stakeholders
  agendaService.instanciate = instanciate( agendaService );

  agendaService.new = newStakeholder;

  return agendaService;


  function newStakeholder( options ) {

    let stakeholder = utils.extend( {
      userId: null, // required
      credential: 1 // contributor
    }, options || {}, {
      agendaId: agendaId
    } );

    if ( !stakeholder.userId ) {

      throw 'userId is required';

    }

    return agendaService.instanciate( stakeholder );

  }


  function get( identifiers, options, cb ) {

    if ( arguments.length === 2 ) {

      cb = options;
      options = {};

    }

    let params = Object.assign( {
      instanciate: false
    }, options || {} );

    getters.get( identifiers, ( err, stakeholder ) => {

      if ( err ) return cb( err );

      // avoid instanciating empty result
      if ( !stakeholder ) {

        return cb( null, null );

      }

      cb( null, params.instanciate ? agendaService.instanciate( stakeholder ) : stakeholder );

    } );

  }

}

function user( userId ) {

  if ( !config ) {

    throw 'service not initialized';

  }

  let getters = gettersLib.user( userId );

  // exposed part of the service for a specific user
  const userService = {
    list: getters.list
  };

  return userService;

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

    gettersLib.init( {
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

    instanciate.init( {
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