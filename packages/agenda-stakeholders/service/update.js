"use strict";

const 

  _ = require( 'lodash' ),

  get = require( './get' ),

  utils = require( 'utils' ),
  
  format = require( './format' ),
  
  logger = require( 'basic-logger' ),

  settings = require( './settings' ),

  Process = require( 'process-service' ),
  
  types = require( '../iso/credentialTypes' ),
  
  validate = require( './lib/validate.process' ),

  cleanLinkStore = require( './lib/cleanLinkStore.process' );


module.exports = _.extend( update, {
  init
} );


let interfaces, knex, schemas, log;

const updateProcess = new Process( {
  tasks: {
    get,
    validate,
    cleanLinkStoreByStakeholder: cleanLinkStore.byStakeholder,
    _merge,
    _doUpdate,
  },
  process: [ {
    task: 'get',
    in: [ 'base', 'identifiers' ],
    out: [ {
      condition: [ { $raw: null } ],
      assign: [ , 'result.errors', { $raw: { 'result.success' : false } } ],
      end: true
    }, {
      assign: [ 'stakeholder' ]
    } ]
  }, {
    task: 'cleanLinkStoreByStakeholder',
    in: [ 'stakeholder', 'options.userId', 'options.linkStore' ],
    out: [ {
      assign: [ 'options.linkStore' ]
    } ]
  }, {
    task: '_merge',
    in: [ 'stakeholder', 'data', 'options' ],
    out: [ {
      assign: [ 'merged' ]
    } ]
  }, {
    task: 'validate',
    in: {
      data: 'merged',
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
    task: '_doUpdate',
    in: [ 'base', 'stakeholder', 'merged', 'options' ],
    out: [ {
      condition: false,
      assign: [ 'result.success', 'result.errors' ]
    } ]
  }, {
    task: 'get',
    in: [ 'base', { id: 'stakeholder.id' } ],
    out: [ {
      condition: [ { $raw: null } ],
      assign: [ { $raw: { 'result.success' : false } }, {} ]
    }, {
      assign: 'result.stakeholder'
    } ]
  } ]
} );


function update( base, identifiers, data, options, cb ) {

  if ( arguments.length === 4 ) {

    cb = arguments[ 3 ]
    options = {}

  }

  updateProcess.run( {
    base,
    settings: settings( base.agendaId ),
    identifiers,
    stakeholder: null,
    data,
    merged: null,
    options: _.extend( {
      allowPartial: false,
      credential: null,
      userId: null
    }, options ),
    result: {
      success: null,
      stakeholder: null,
      errors: []
    }
  }, ( err, processResult ) => {

    if ( err ) {

      return cb( err.error, null, err );

    }

    if ( interfaces && interfaces.onUpdate && processResult.values.result.success ) {

      interfaces.onUpdate( processResult.values.stakeholder, processResult.values.result.stakeholder );

    }

    cb( null, processResult.values.result, processResult.report );

  } );

}

function _doUpdate( base, stakeholder, merged, options, cb ) {

  let toUpdate = {
    custom: merged,
    updatedAt: new Date()
  };

  if ( options.credential !== null ) {

    toUpdate.credential = options.credential;

  }

  if ( options.userId ) {

    if ( stakeholder.userId ) return cb( 'cannot re-assign userId' );

    toUpdate.userId = options.userId;

  }

  if ( options.linkStore ) {

    toUpdate.linkStore = options.linkStore;

  }

  knex( schemas.stakeholder )

    .update( format.objToDb( toUpdate, true ) )

    .where( {
      id: stakeholder.id
    } )

  .asCallback( ( err, result ) => {

    if ( err ) return cb( err );

    cb( null, true, [] );

  } );

}

function _merge( stakeholder, data, options, cb ) {

  let current = utils.toCamelCase( stakeholder.custom ),

    update = utils.toCamelCase( data );

  if ( options.allowPartial ) {

    return cb( null, _.assign( {}, current, update ) );

  }

  cb( null, update );

}

function init( config ) {

  log = logger( 'update' );

  log( 'initing' );

  schemas = config.schemas;

  knex = config.knex;

  interfaces = config.interfaces;

}