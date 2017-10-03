"use strict";

const config = require( './config' );
const { cleanSession, callbackify, interfaces, redisCommand } = require( './helpers' );
const cookieValidate = require( '../iso/cookie.validate' );
const log = require( 'logs' )( 'sessions/open' );
const validate = require( './validate' );
const expressCookie = require( './expressCookie' );
const _ = require( 'lodash' );


module.exports = ( request, response, identifier, cb ) => {

  if ( !cb ) {

    cb = identifier;
    identifier = response;
    response = null;

  }

  callbackify( open( request, response, identifier ), cb );

}

module.exports.promise = open;

async function open( request, response, identifier ) {

  if ( !config.initialized ) throw new Error( 'service has not been initialized' );

  log( 'attempting session open for user %j', identifier );

  let user;

  // fetch user data from interface

  try {

    user = await interfaces( 'getUser', identifier );

  } catch ( e ) {

    log( 'error', e );

    throw e;

  }

  let sessionUser = null, cookieData = null;

  if ( !user ) {

    log( 'info', 'no user matching user was found for identifier %j', identifier );

    return {
      success: false,
      errors: [ { code: 'user.notfound' } ]
    }

  }

  // validate user data

  try {

    sessionUser = validate( _.extend( {
      latestActivity: new Date()
    }, user ) );

  } catch ( errors ) {

    log( 'error', 'user validation failed on %j', user );

    return { errors, success: false }

  }

  // store session in redis
  try {

    await redisCommand( 'set', [ [ config.redis.prefix, sessionUser.uid ].join( ':' ), JSON.stringify( sessionUser ) ] );

    await redisCommand( 'expire', [ [ config.redis.prefix, sessionUser.uid ].join( ':' ), config.expire ] );

  } catch ( e ) {

    log( 'error', 'session could not be stored in redis for user %s', user );

    throw new VError( e, 'sessions could not be stored in redis for user %j', user );

  }  

  // store session in cookie

  cookieData = cookieValidate( { user: sessionUser } );

  cleanSession( request.session, cookieData );

  // clear writable cookie
  if ( response ) {
    
    expressCookie( config.writableCookie.name, request, response ).clear();

  }

  return {
    success: true,
    data: sessionUser,
    cookieData,
    errors: []
  }

}