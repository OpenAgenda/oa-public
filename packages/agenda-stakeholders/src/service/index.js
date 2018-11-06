"use strict";

const _ = require( 'lodash' );
const knexLib = require( 'knex' );
const w = require( 'when' );

const bulk = require( './bulk' );
const create = require( './create' );
const dbUtils = require( './dbUtils' );
const get = require( './get' );
const increment = require( './increment' );
const instanciate = require( './instanciate' );
const legacy = require( './legacy' );
const logger = require( '@openagenda/logs' );
const list = require( './list' );
const message = require( './message' );
const remove = require( './remove' );
const settings = require( './settings' );
const stats = require( './stats' );
const transferEvent = require( './transferEvent' );
const update = require( './update' );

const validateInteger = require( '@openagenda/validators/integer' )( { optional: false } );

const log = logger( 'index' );

let knex, config, schemas;

module.exports = Object.assign( agenda, {
  init,
  user,
  agenda,
  tasks: {
    bulk: bulk.task,
    message: message.task
  },
  types: require( '../iso/credentialTypes' )
} );


function agenda( aId ) {

  let agendaId;

  if ( !config ) {

    throw new Error( 'service not initialized' );

  }

  try {

    agendaId = validateInteger( aId );

  } catch( e ) {

    throw new Error( 'agendaId is not a number' );

  }

  let s = settings( agendaId );

  // separate reference for re-use within service
  let agendaService = {},

    agendaStakeholderInstanciate = instanciate( agendaService );

  _.extend( agendaService, {
    get: instanciatedGet,
    list: list.bind( null, { agendaId } ),
    stats: stats.bind( null, { agendaId } ),
    remove: remove.bind( null, { agendaId } ),
    create: create.bind( null, { agendaId } ),
    update: update.bind( null, { agendaId } ),

    // increment stakeholder counter - optimized ( 'actions' only )..
    increment: increment.bind( null, { agendaId } ),

    bulk: bulk.bind( null, { agendaId } ),
    message: message.bind( null, { agendaId } ),

    transferEvent: transferEvent( agendaId ),
    instanciate: agendaStakeholderInstanciate,
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

    return agendaService.instanciate( _.extend( {
      deletedUser: false,
      userId: null,
      credential: 1 // contributor
    }, options || {}, {
      agendaId
    } ) );

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

      logger.setModuleConfig( c.logger );
      
    }

  } )

  .then( () => {

    if ( knex ) return;

    knex = knexLib( {
      client: 'mysql',
      connection: c.mysql
      //debug: true
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
      schemas,
      interfaces: config.interfaces
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
      schemas,
      interfaces: config.interfaces
    } );

  } )

  .then( () => {

    create.init( {
      knex,
      schemas,
      interfaces: config.interfaces,
    } );

  } )

  .then( () => {

    increment.init( {
      knex,
      schemas,
    } );

  } )

  .then( () => {

    bulk.init( {
      queue: config.queue,
      interfaces: config.interfaces
    } );

  } )

  .then( () => {

    message.init( {
      queue: config.queue,
      interfaces: config.interfaces
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

    stats.init( { 
      knex, 
      schemas, 
      interfaces: config.interfaces
    } );

  } )

  .then( () => {

    dbUtils.init( {
      knex,
      schemas
    } );

  } )

  .then( () => {

    update.init( {
      knex,
      schemas,
      interfaces: config.interfaces
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

  .done( err  => {

    log( 'init done' );

    if ( !cb ) return;

    cb( err );

  } );

}
