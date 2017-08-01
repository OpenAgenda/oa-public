"use strict";

const config = require( './config' );
const { cleanSession, callbackify, redisCommand, interfaces } = require( './helpers' );
const cookieValidate = require( '../iso/cookie.validate' );
const logger = require( 'basic-logger' );
const validate = require( './validate' );
const _ = require( 'lodash' );

let log = console.log;

module.exports = ( request, identifier, cb ) => {

  callbackify( open( request, identifier ), cb );

}

module.exports.init = () => {

  log = logger( 'open' );

}

module.exports.promise = open;

async function open( request, identifier ) {

  if ( !config.initialized ) throw new Error( 'service has not been initialized' );

  // fetch user data from interface

  const user = await interfaces( 'getUser', identifier );

  let sessionUser = null, cookieData = null;

  if ( !user ) {

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

    return { errors, success: false }

  }

  // store session in redis

  await redisCommand( 'set', [ [ config.redis.prefix, sessionUser.uid ].join( ':' ), JSON.stringify( sessionUser ) ] );

  await redisCommand( 'expire', [ [ config.redis.prefix, sessionUser.uid ].join( ':' ), config.expire ] );

  // store session in cookie

  cookieData = cookieValidate( { user: sessionUser } );

  cleanSession( request.session, cookieData );

  return {
    success: true,
    data: sessionUser,
    cookieData,
    errors: []
  }

}