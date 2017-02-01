"use strict";

const _ = require( 'lodash' ),
 
  logger = require( 'basic-logger' ),
 
  Stakeholder = require( '../iso/Stakeholder' ),
 
  Process = require( 'process-service' ),
 
  validator = require( '../iso/validator' ),

  types = require( '../iso/credentialTypes' ),

  format = require( './format' ),

  get = require( './get' ),
 
  settings = require( './settings' ),

  queue = require( 'queue' ),

  async = require( 'async' ),

  createSingle = create();
 
let log, createProcess, q, queueConfig;

module.exports = _.extend( createSingle, { 
  bulk,
  task,
  init
} );

let schemas, knex, interfaces;


function create() {

  const p = new Process( {
    tasks: {
      _validate,
      _checkEmail,
      _loadUser,
      _createStakeholder,
      _loadStakeholder
    },
    process: [ {

      path: 'main',
      task: '_validate',
      in: { 
        data: 'data', 
        allowPartial: 'options.allowPartial',
        settings: 'settings'
      },
      out: [ {
        assign: [ 'result.valid', 'result.success', 'result.errors' ]
      }, {
        condition: false,
        end: true
      } ]

    }, {

      path: 'main',
      task: '_checkEmail',
      condition: [ {
        'options.allowPartial': true,
        'result.valid' : true
      } ],
      in: [ 'base.agendaId', 'data.email' ],
      out: [ {
        condition: false,  
        assign: [ 'result.valid', 'result.success', 'result.errors' ],
        end: true
      } ]

    }, {

      path: 'main',
      task: '_loadUser',
      in: [ 'data.email' ],
      out: [ {
        assign: [ 'result.user' ]
      } ]
    }, {

      path: 'main',
      task: '_createStakeholder',
      in: [ 'base', 'data', 'result.user', 'options' ],
      out: [ {
        condition: [ { $raw: null } ],
        assign: [ , 'result.errors', { $raw: { 'result.success': false } } ]
      }, {
        assign: [ 'stakeholderId', { $raw: { 'result.success': true } } ]
      } ]

    }, {

      path: 'main',
      task: '_loadStakeholder',
      in: [ 'base.agendaId', 'stakeholderId' ],
      out: [ {
        assign: 'result.stakeholder'
      } ]

    } ]
  } );

  return function ( base, data, options, cb ) {

    let s = settings( base.agendaId );

    if ( arguments.length === 3 ) {

      options = {};
      cb = arguments[ 2 ];

    }

    p.run( {
      base, // base values to use 
      settings: s,
      data,
      options: _.extend( {
        allowPartial: false,
        credential: types.get( 'contributor' )
      }, options ),
      result: {
        success: null,
        stakeholder: null,
        errors: []
      }
    }, ( err, processResult ) => {

      if ( err ) return cb( err );

      if ( interfaces && interfaces.onCreate && processResult.values.result.success ) {

        interfaces.onCreate( processResult.values.result.stakeholder );

      }

      cb( null, processResult.values.result, processResult.report );

    } );

  }

}




/**
 * this guy takes emails. Or stakeholder data
 * and decides whether to put in queue
 * or to process on the fly.
 * 
 */
function bulk( base, listData, options, cb ) {

  if ( arguments.length === 3 ) {

    options = {};
    cb = arguments[ 2 ];

  }

  if ( !_.isArray( listData ) ) {

    return cb( 'input data must be a list' );

  }

  if ( listData.length > queueConfig.threshold ) {

    _queueCreates( base, listData, options, cb );

  } else {

    _doCreates( base, listData, options, cb );

  }

}

/**
 * this guy processes bulked things.
 */
function task( onCreate = null ) {

  q.setConsumer( ( { base, data, options }, cb ) => {

    createSingle( base, data, options, ( err, result ) => {

      if ( onCreate ) onCreate( err, result );

      cb();

    } );

  } );

  q.launch();

  return {
    shutdown: q.shutdown
  }

}

function init( config ) {

  log = logger( 'bulkCreate' );

  log( 'initing' );

  schemas = config.schemas;

  knex = config.knex;

  interfaces = config.interfaces;

  queueConfig = config.queue;

  q = queue( queueConfig.name, { redis: queueConfig.redis } );

}


function _doCreates( base, listData, options, cb ) {

  let results = [];

  async.eachSeries( listData, ( data, ecb ) => {

    createSingle( base, data, options, ( err, result ) => {

      results.push( [ err, result ] );

      ecb();

    } );

  }, err => {

    if ( err ) return cb( err );

    cb( null, {
      queued: false,
      results
    } );

  } );

}


function _queueCreates( base, listData, options, cb ) {

  return async.eachSeries( listData, ( data, ecb ) => {

    q( { base, data, options }, ecb );

  }, err => {

    if ( err ) return cb( err );

    cb( null, {
      queued: true
    } );

  } );

}



function _validate( { data, allowPartial, settings }, cb ) {

  settings.get( ( err, s ) => {

    if ( err ) return cb( err );

    // settings fields follow a legacy structure ( list of fields )
    // that must be converted to a 'validators/schema' friendly map
    let stakeholder = new Stakeholder( data, {
      schemaMap: validator.convertFieldsToSchemaMap( s.fields )
    } ),

    valid = stakeholder.isValid( allowPartial );

    cb( null, valid, valid, stakeholder.getErrors( allowPartial ) );

  } );

}


function _createStakeholder( base, data, user, options, cb ) {

  knex( schemas.stakeholder )

    .insert( format.objToDb( {
      updatedAt: new Date(),
      createdAt: new Date(),
      credential: options.credential,
      custom: data,
      agendaId: base.agendaId,
      userId: user ? user.id : null
    } ) )

    .asCallback( ( err, insertIds ) => {

      if ( err ) return cb( err );

      if ( !insertIds.length ) return cb( 'could not create stakeholder' );

      cb( null, insertIds[ 0 ] ); 

    } );

}


function _loadStakeholder( agendaId, stakeholderId, cb ) {

  get( { agendaId }, { id: stakeholderId }, cb );

}


function _loadUser( email, cb ) {

  interfaces.getUser( { email }, cb );

}


function _checkEmail( agendaId, email, cb ) {

  if ( !email ) {

    return cb( null, false, false, [ {
      origin: email,
      code: 'email.missing',
      field: 'email'
    } ] );

  }

  get( { agendaId }, { email }, ( err, stakeholder ) => {

    if ( err ) return cb( err );

    if ( stakeholder ) {

      return cb( null, false, false, [ {
        origin: email,
        code: 'email.already_created',
        field: 'email'
      } ] );

    }

    cb( null, true, true, [] );

  } );

}