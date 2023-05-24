"use strict";

const config = require( './config' );
const { cleanSession, callbackify, getUser } = require( './helpers' );
const cookieValidate = require( '../../iso/cookie.validate' );
const log = require( '@openagenda/logs' )( 'sessions/open' );
const validate = require( './validate' );
const expressCookie = require( './expressCookie' );
const _ = require( 'lodash' );
const VError = require( '@openagenda/verror' );


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

  let user = await getUser( identifier );

  let sessionUser = null, cookieData = null;

  if ( !user ) {

    log( 'info', 'no user matching user was found for identifier %j', identifier );

    return {
      success: false,
      errors: [ { code: 'user.notfound' } ]
    }

  }

  // validate user data

  const latestActivity = new Date();
  const expires = new Date(latestActivity.getTime() + config.expire * 1000);

  try {

    sessionUser = validate( _.extend( {
      latestActivity,
      expires
    }, user ) );

  } catch ( errors ) {

    log( 'error', 'user validation failed on %j', user, errors );

    return { errors, success: false }

  }

  // store session in redis
  try {

    const sessionKey = [ config.redis.prefix, sessionUser.uid ].join( ':' );

    await config.redisClient.set(sessionKey, JSON.stringify(sessionUser));
    await config.redisClient.expire(sessionKey, config.expire);

  } catch ( e ) {

    log( 'error', 'session could not be stored in redis for user %s', user );

    throw new VError( e, 'sessions could not be stored in redis for user %j', user );

  }

  // store session in cookie

  cookieData = cookieValidate( {
    user: sessionUser,
    expires
  } );

  cleanSession( request.session, cookieData );

  // clear writable cookie
  if ( response ) {

    expressCookie( config.writableCookie.name, request, response ).clear();

  }

  log( 'info', 'session opened', {
    uid: user.uid,
    email: user.email
  } );

  return {
    success: true,
    data: sessionUser,
    cookieData,
    errors: []
  }

}
