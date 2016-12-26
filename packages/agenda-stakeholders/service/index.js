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

get = require( './get' ),

list = require( './list' ),

legacy = require( './legacy' ),

logger = require( 'basic-logger' ),

settings = require( './settings' );

module.exports = Object.assign( agenda, {
  init,
  user,
  agenda
} );

function agenda( agendaId ) {

  if ( !config ) {

    throw 'service not initialized';

  }

  let s = settings( agendaId ),

  // exposed part of the service for a specific agenda
  agendaService = {};

  // set stakeholder requirements
  agendaService.settings = { 
    get: s.get,
    set: s.set,
    clear: s.clear,
    setDefault: s.setDefault,
    custom: {
      validate: s.custom.validate,
      toValues: s.custom.toValues,
      toFields: s.custom.toFields
    }
  };

  // get a stakeholder of an agenda
  agendaService.get = instanciatedGet;

  // list stakeholders of an agenda
  agendaService.list = list.bind( null, { agendaId } );

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
      agendaId
    } );

    if ( !stakeholder.userId ) {

      throw 'userId is required';

    }

    return agendaService.instanciate( stakeholder );

  }


  function instanciatedGet( identifiers, options, cb ) {

    if ( arguments.length === 2 ) {

      cb = options;
      options = {};

    }

    get( { agendaId }, identifiers, options, ( err, stakeholder ) => {

      if ( err ) return cb( err );

      cb( null, stakeholder && options.instanciate ? agendaService.instanciate( stakeholder ) : stakeholder );

    } );

  }

}

function user( userId ) {

  if ( !config ) {

    throw 'service not initialized';

  }

  // exposed part of the service for a specific user
  const userService = {
    list: list.bind( null, { userId } ),
    get: get.bind( null, { userId } )
  };

  return userService;

}


function init( c, cb ) {

  schemas = c.schemas;

  config = Object.assign( {
    interfaces: false
  }, c );

  w().then( () => {

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

    legacy.init( {
      knex,
      schemas
    } );

  } )

  .then( () => {

    transferEvent.init( {
      knex,
      schemas
    } );

  } )

  .then( () => {

    get.init( {
      knex,
      schemas,
      interfaces: config.interfaces
    } );

  } )

  .then( () => {

    list.init( {
      knex,
      schemas,
      interfaces: config.interfaces
    } )

  } )

  .then( () => {

    dbUtils.init( {
      knex,
      schemas
    } );

  } )

  .then( () => {

    instanciate.init( {
      knex,
      schemas
    } );

  } )

  .then( () => {

    return settings.init( {
      mysql: c.mysql,
      knex,
      schemas
    } );

  } )

  .done( () => cb(), cb );

}