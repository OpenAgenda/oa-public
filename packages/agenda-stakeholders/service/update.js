"use strict";

const get = require( './get' ),

  validate = require( './lib/validate.process' ),

  utils = require( 'utils' ),

  Process = require( 'process-service' ),

  types = require( '../iso/credentialTypes' ),

  format = require( './format' ),

  logger = require( 'basic-logger' ),

  settings = require( './settings' ),

  _ = require( 'lodash' );

module.exports = _.extend( update, {
  init
} );


let interfaces, knex, schemas, log;

const updateProcess = new Process( {
  tasks: {
    get,
    validate,
    _merge,
    _doUpdate
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
      credential: null
    }, options ),
    result: {
      success: null,
      stakeholder: null,
      errors: []
    }
  }, ( err, processResult ) => {

    if ( err ) return cb( err );

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