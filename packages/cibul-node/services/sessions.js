"use strict";

const sessions = require( 'sessions' );

const userSvc = require( 'users' );

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
      culture: u.culture
    } );

  } );

}