"use strict";

const _ = require( 'lodash' ),
 
  logger = require( '@openagenda/basic-logger' ),
 
  Process = require( '@openagenda/process-service' ),

  types = require( '../iso/credentialTypes' ),

  format = require( './format' ),

  get = require( './get' ),

  validate = require( './lib/validate.process' ),

  validateContext = require( './lib/validateContext.process' ),
 
  settings = require( './settings' );
 
let log;

module.exports = _.extend( create, { 
  init
} );

let schemas, knex, interfaces;

const createProcess = new Process( {
  tasks: {
    validate,
    validateContext,
    get,
    _checkEmail,
    _loadUser,
    _loadName,
    _doCreate,
  },
  process: [ {
    task: 'validate',
    in: { 
      data: 'data', 
      allowPartial: 'options.allowPartial',
      settings: 'settings'
    },
    out: [ {
      assign: [ 'result.valid', 'result.success', 'result.errors' ]
    }, {
      condition: false,
      end: true
    } ]
  }, {
    task: 'validateContext',
    in: 'options.context',
    out: [ {
      assign: [ 'result.valid', 'result.context' ]
    }, {
      condition: false,
      assign: [ 'result.valid', , 'result.contextErrors' ],
      end: true
    } ]
  }, {
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
    task: '_loadUser',
    in: [ 'data.email' ],
    out: [ {
      assign: [ 'result.user' ]
    } ]
  }, {
    task: '_loadName',
    in: [ 'data', 'result.user' ],
    out: [ {
      assign: [ 'data' ]
    } ]
  }, {
    task: '_doCreate',
    in: [ 'base', 'data', 'result.user', 'options' ],
    out: [ {
      condition: [ { $raw: null } ],
      assign: [ , 'result.errors', { $raw: { 'result.success': false } } ]
    }, {
      assign: [ 'stakeholderId', { $raw: { 'result.success': true } } ]
    } ]
  }, {
    task: 'get',
    in: [ 'base', { id: 'stakeholderId' } ],
    out: [ {
      assign: 'result.stakeholder'
    } ]
  } ]
} );

function create( base, data, options, cb ) {

  if ( arguments.length === 3 ) {

    options = {};
    cb = arguments[ 2 ];

  }

  createProcess.run( {
    base, // base values to use 
    settings: settings( base.agendaId ),
    data,
    options: _.extend( {
      allowPartial: false,
      credential: types.get( 'contributor' ),
      context: null
    }, options ),
    result: {
      success: null,
      stakeholder: null,
      errors: []
    }
  }, ( err, processResult ) => {

    if ( err ) return cb( err );

    if ( interfaces && interfaces.onCreate && processResult.values.result.success ) {

      interfaces.onCreate( processResult.values.result.stakeholder, processResult.values.result.context );

    }

    cb( null, processResult.values.result, processResult.report );

  } );

}


function init( config ) {

  log = logger( 'create' );

  log( 'initing' );

  schemas = config.schemas;

  knex = config.knex;

  interfaces = config.interfaces;

}


function _loadName( data, user, cb ) {

  if ( !data.contactName && !data.contact_name && user ) {

    data.contactName = user.full_name;

  }

  cb( null, data );

}


function _doCreate( base, data, user, options, cb ) {

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

    if ( !insertIds.length ) {

      return cb( 'could not create stakeholder' );

    }

    cb( null, insertIds[ 0 ] ); 

  } );

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