"use strict";

const sessions = require( 'sessions' );

const userSvc = require( 'users' );

const _ = require( 'lodash' );

module.exports.init = config => {

  sessions.init( {
    redis: {
      host: config.redis.host,
      port: config.redis.port,
      prefix: config.session.namespace
    },
    sessionCookie: config.session,
    writableCookie: {
      maxAge: config.session.maxAge,
      name: config.session.writableName // overriden by iso configuration
    },
    expire: config.session.maxAge / 1000,
    interfaces: {
      getUser: getUser.bind( null, config.aws.imageBucketPath )
    },
    logger: {
      token: process.env.NODE_ENV === 'production' ? '1d8d933d-abb6-4750-b2e1-cefa96f9a0b8' : null
    }
  } );

}

function getUser( imageBucketPath, query, cb ) {

  userSvc.get( query, { detailed: true }, ( err, u ) => {

    if ( err || !u ) return cb( err, u );

    cb( null, {
      id: u.id,
      uid: u.uid,
      name: u.full_name,
      thumbnail: u.image ? imageBucketPath + u.image : null,
      email: u.email,
      culture: u.culture,
      isNew: !!u.is_new
    } );

  } );

}