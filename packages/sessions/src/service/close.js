"use strict";

const { cleanSession, callbackify } = require( './helpers' );
const _ = require( 'lodash' );

module.exports = (config, request, cb ) => {

  callbackify( close( config, request ), cb );

}

function closeByUid(config, uid) {
  return config.redisClient.del([config.redis.prefix, uid].join(':'))
}

async function close( config, request ) {

  const cookieUser = cleanSession( request.session ).user;

  if ( !cookieUser ) {

    return {
      success: false,
      errors: [ { code: 'user.notfound' } ]
    }

  }

  await closeByUid(config, cookieUser.uid)

  request.session = null;

  return {
    success: true
  }

}

module.exports.byUid = closeByUid;
