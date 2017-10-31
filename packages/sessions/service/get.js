"use strict";

const config = require( './config' );
const { cleanSession, callbackify, redisCommand } = require( './helpers' );
const log = require( '@openagenda/logs' )( 'get' );
const _ = require( 'lodash' );

module.exports = ( uidOrRequest, options, cb ) => {

  if ( cb === undefined ) {

    cb = options;

    options = {};

  }

  callbackify( get( uidOrRequest, options ), cb );

}

module.exports.promise = get;

async function get( uidOrRequest, options = {} ) {

  if ( !( _.isObject( uidOrRequest ) && uidOrRequest.cookies ) ) {

    return _getFromUid( uidOrRequest, options );

  }

  return _getFromRequest( uidOrRequest, options );

}

async function _getFromRequest( request, options = {} ) {

  const cookieUser = cleanSession( request.session ).user;

  if ( !cookieUser ) return null;

  const stored = await _getFromUid( cookieUser.uid, options );

  if ( !stored ) return null;

  return _.extend( cookieUser, stored );

}

async function _getFromUid( uid, options = {} ) {

  let result = await redisCommand( 'get', [  config.redis.prefix, uid ].join( ':' ) );

  if ( !result ) return null;

  try {

    return JSON.parse( result );

  } catch ( e ) {

    log( 'error', 'could not parse store for user %s: %s', uid, result );

    return null;

  }

}