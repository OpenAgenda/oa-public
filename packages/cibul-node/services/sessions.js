"use strict";

const _ = require( 'lodash' );
const usersSvc = require( '@openagenda/users' );
const sessions = require( '@openagenda/sessions' );
const log = require( '@openagenda/logs' )( 'sessions' );


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

  log( 'info', 'requested user with %j', query );

  usersSvc.findOne( { query: _.pick( query, 'id', 'uid', 'email' ), detailed: true } )
    .then( user => {

      console.log( 'UUUSSSEEERRR', user );

      log( 'info', 'retrieved user %j', user );
      cb( null, {
        id: user.id,
        uid: user.uid,
        name: user.fullName,
        thumbnail: user.image ? imageBucketPath + user.image : null,
        email: user.email,
        culture: user.culture,
        isNew: !!user.isNew
      } );

    } )
    .catch( err => {

      log( 'error', 'failed to retrieve user: %s', JSON.stringify( err ) );
      cb( err, null );

    } );

}