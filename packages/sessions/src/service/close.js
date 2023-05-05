"use strict";

const config = require( './config' );
const { cleanSession, callbackify } = require( './helpers' );
const log = require( '@openagenda/logs' )( 'close' );
const _ = require( 'lodash' );

module.exports = ( request, cb ) => {

  callbackify( close( request ), cb );

}

function closeByUid(uid) {
  return config.redisClient.del([config.redis.prefix, uid].join(':'))
}

async function close( request ) {

  const cookieUser = cleanSession( request.session ).user;

  if ( !cookieUser ) {

    return {
      success: false,
      errors: [ { code: 'user.notfound' } ]
    }

  }

  const result = await closeByUid(cookieUser.uid)

  request.session = null;

  return {
    success: true
  }

}

module.exports.byUid = closeByUid;
