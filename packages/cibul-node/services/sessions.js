"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );
const sessions = require( '@openagenda/sessions' );
const log = require( '@openagenda/logs' )( 'sessions' );
const usersSvc = require( './users' );

const service = {
  mw: {
    loadOrRedirect: Object.assign(loadOrRedirect, {
      options: loadOrRedirectOptions
    })
  }
};

module.exports = service;

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
    logger: config.getLogConfig( 'oa', 'sessions', false )
  } );

  Object.assign( service, sessions );
}

function loadOrRedirect(req, res, next) {
  return _loadOrRedirect({ detailed: false, msg: 'authRequired' }, req, res, next);
}

function loadOrRedirectOptions(options) {
  return _loadOrRedirect.bind(null, options);
}

function _loadOrRedirect({detailed, msg}, req, res, next) {
  sessions.get(req, {detailed}, (err, user) => {
    if (err) return next(err);
    if (!user) {
      const redirect = new Buffer(req.originalUrl, 'utf-8').toString('base64');
      return res.redirect(302, `${req.agenda?'/'+req.agenda.slug:''}/signin?redirect=${redirect}&msg=${msg}`);
    }
    req.user = user;
    next();
  } );
}

function getUser( imageBucketPath, query, cb ) {

  log( 'info', 'requested user with %j', query );

  usersSvc.findOne( { query: _.pick( query, 'id', 'uid', 'email' ), detailed: true } )
    .then( user => {

      if ( !user ) {
        const  error = new VError( 'failed to retrieve user: %s', _.pick( query, 'id', 'uid', 'email' ) );

        log( 'error', error );

        return cb( error );
      }

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

      log( 'error', new VError( err, 'failed to retrieve user: %j', _.pick( query, 'id', 'uid', 'email' ) ) );
      cb( err, null );

    } );

}
