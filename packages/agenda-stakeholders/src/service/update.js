"use strict";

const _ = require( 'lodash' );

const utils = require( '@openagenda/utils' );

const Process = require( '@openagenda/process-service' );

const get = require( './get' );
const format = require( './format' );
const settings = require( './settings' );
const types = require( '../iso/credentialTypes' );
const validate = require( './lib/validate.process' );
const validateContext = require( './lib/validateContext.process' );

const log = require( '@openagenda/logs' )( 'update' );

module.exports = _.extend( update, {
  init
} );


let interfaces, knex, schemas;

const updateProcess = new Process( {
  tasks: {
    get,
    validate,
    validateContext,
    _merge,
    _doUpdate,
  },
  process: [ {
    task: 'get',
    in: [ 'base', 'identifiers' ],
    out: [ {
      condition: [ { $raw: null } ],
      assign: [ , 'result.errors', { $raw: { 'result.success' : false } } ],
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
    task: '_doUpdate',
    in: [ 'base', 'stakeholder', 'merged', 'options' ],
    out: [ {
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
      userId: null,
      deletedUser: null
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

      interfaces.onUpdate( processResult.values.stakeholder, processResult.values.result.stakeholder, processResult.values.result.context );

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

  if ( options.deletedUser !== null ) {

    toUpdate.deletedUser = options.deletedUser;

  }

  if ( options.userId ) {

    if ( stakeholder.userId ) return cb( 'cannot re-assign userId' );

    toUpdate.userId = options.userId;

  }

  if ( options.linkStore ) {

    toUpdate.linkStore = options.linkStore;

  }

  knex( schemas.stakeholder )

    .update( _.extend( 
      format.objToDb( toUpdate, true ), options.deletedUser === true ? {
        user_id: null
      } : {} ) 
    )

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

  schemas = config.schemas;

  knex = config.knex;

  interfaces = config.interfaces;

}