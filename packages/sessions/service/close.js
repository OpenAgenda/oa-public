"use strict";

const config = require( './config' );
const { cleanSession, redisCommand, callbackify } = require( './helpers' );
const logger = require( 'basic-logger' );
const _ = require( 'lodash' );

let log = console.log;

module.exports = ( request, cb ) => {

  callbackify( close( request ), cb );

}

module.exports.init = () => {

  log = logger( 'close' );

}

async function close( request ) {

  const cookieUser = cleanSession( request.session ).user;

  if ( !cookieUser ) {

    return {
      success: false,
      errors: [ { code: 'user.notfound' } ]
    }

  }

  let result = await redisCommand( 'hdel', [  config.redis.hash, cookieUser.uid ] );

  request.session = null;

  return {
    success: true
  }

}