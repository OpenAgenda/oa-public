"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );

const queue = require( '@openagenda/queue' );

const create = require( './create' );
const get = require( './get' );
const types = require( '../iso/credentialTypes' );
const update = require( './update' );

const log = require( '@openagenda/logs' )( 'bulkCreate' );

module.exports = _.extend( bulk, {
  task,
  init
} );

let q, queueConfig, interfaces;


/**
 * this guy takes emails. Or stakeholder data
 * and decides whether to put in queue
 * or to process on the fly.
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

    _queue( base, listData, options, cb );

  } else {

    _process( base, listData, options, cb );

  }

}


/**
 * this guy processes bulky work
 * onCreate is likely used for testing only
 */
function task( onCreate = null ) {

  q.setConsumer( ( { base, data, options }, cb ) => {

    _processSingle( base, data, options, ( err, result ) => {

      if ( onCreate ) onCreate( err, result );

      cb( err, result );

    } );

  } );

  q.launch();

  return {
    shutdown: q.shutdown
  }

}

function init( config ) {

  queueConfig = config.queue;

  interfaces = config.interfaces;

  q = queue( queueConfig.names.bulk, { redis: queueConfig.redis } );

}


function _process( base, listData, options, cb ) {

  let results = [];

  async.eachSeries( listData, ( data, ecb ) => {

    _processSingle( base, data, options, ( err, result ) => {

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


function _queue( base, listData, options, cb ) {

  return async.eachSeries( listData, ( data, ecb ) => {

    q( { base, data, options }, ecb );

  }, err => {

    if ( err ) return cb( err );

    cb( null, {
      queued: true
    } );

  } );

}


/**
 * get user in stakeholders by email or through interfaces.getUser
 */

function _getStakeholderByEmail( base, email, options, cb ) {

  get( base, { email }, options, ( err, stakeholder ) => {

    if ( err ) return cb( err );

    if ( stakeholder ) return cb( null, stakeholder );

    interfaces.getUser( { email }, ( err, user ) => {

      if ( err ) return cb( err );

      if ( !user ) return cb( null );

      // get stakeholder using user id
      get( base, { userId: user.id }, cb );

    } );

  } );

}


/**
 * Decide whether the handle should be an update or a create. And execute.
 */
function _processSingle( base, data, options, cb ) {

  if ( _.isObject( data ) && data.email ) {

    _getStakeholderByEmail( base, data.email, options, ( err, stakeholder ) => {

      if ( err ) return cb( err );

      if ( !stakeholder ) return _create( base, data, options, cb );

      // if a stakeholder exists and has a different credential
      // than required, update only if cred is superior

      if ( types.isSuperiorTo( stakeholder.credential, options.credential ) ) {

        return cb( null, {
          operation: null,
          success: false,
          errors: [ {
            field: 'credential',
            code: 'credential.downgrade',
            origin: options.credential || types.get( 'contributor' )
          } ]
        } );

      }

      update( base, { id: stakeholder.id }, data, options, ( err, result ) => {

        if ( err ) return cb( err );

        cb( null, _.extend( result, { operation: 'update' } ) );

      } );

    } );

  } else {

    _create( base, data, options, cb );

  }

}

function _create( base, data, options, cb ) {

  create( base, data, options, ( err, result ) => {

    if ( err ) return cb( err );

    cb( null, _.extend( result, { operation: 'create' } ) );

  } )

}
