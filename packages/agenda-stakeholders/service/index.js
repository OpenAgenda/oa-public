"use strict";

const knexLib = require( 'knex' ),

  w = require( 'when' ),

  _ = require( 'lodash' ),

  get = require( './get' ),

  list = require( './list' ),

  stats = require( './stats' ),

  remove = require( './remove' ),

  logger = require( 'basic-logger' ),

  legacy = require( './legacy' ),

  dbUtils = require( './dbUtils' ),

  settings = require( './settings' ),

  instanciate = require( './instanciate' ),

  transferEvent = require( './transferEvent' );

let knex,

config,

schemas;

module.exports = Object.assign( agenda, {
  init,
  user,
  agenda,
  types: require( '../iso/credentialTypes' )
} );

function agenda( agendaId ) {

  if ( !config ) {

    throw new Error( 'service not initialized' );

  }

  let s = settings( agendaId );

  // separate reference for re-use within service
  let agendaService = {};

  _.extend( agendaService, { 
    get: instanciatedGet,
    list: list.bind( null, { agendaId } ),
    stats: stats.bind( null, { agendaId } ),
    remove: remove.bind( null, { agendaId } ),
    transferEvent: transferEvent( agendaId ),
    instanciate: instanciate( agendaService ),
    new: newStakeholder,
    settings: { 
      get: s.get,
      set: s.set,
      clear: s.clear,
      setDefault: s.setDefault,
      custom: {
        validate: s.custom.validate,
        toValues: s.custom.toValues,
        toFields: s.custom.toFields
      }
    }
  } );

  return agendaService;


  function newStakeholder( options ) {

    let stakeholder = _.extend( {
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

    remove.init( {
      knex,
      schemas
    } );

  } )

  .then( () => {

    list.init( {
      knex,
      schemas,
      interfaces: config.interfaces
    } );

  } )

  .then( () => {

    stats.init( { knex, schemas } );

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