"use strict";

const config = require( './config' );
const { cleanSession, callbackify, redisCommand } = require( './helpers' );
const log = require( 'logs' )( 'close' );
const _ = require( 'lodash' );

module.exports = ( request, cb ) => {

  callbackify( close( request ), cb );

}

async function close( request ) {

  const cookieUser = cleanSession( request.session ).user;

  if ( !cookieUser ) {

    return {
      success: false,
      errors: [ { code: 'user.notfound' } ]
    }

  }

  let result = await redisCommand( 'del', [ config.redis.prefix, cookieUser.uid ].join( ':' ) );

  request.session = null;

  return {
    success: true
  }

}