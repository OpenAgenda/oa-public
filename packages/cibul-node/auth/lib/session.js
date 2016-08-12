"use strict";

var redis = require( 'redis' ),

config = require( '../../config' ),

cmn = require( '../../lib/commons-app' ),

model = require( '../../services/model' );

module.exports = {
  set: set,
  unset: unset,
  syncRedis: syncRedis
}

function set( req, res, user, cb ) {

  req.session.userId = user.id;
  req.session.userUid = user.uid;
  req.session.lang = user.culture || 'fr';
  req.session.logged = true;

  // --- apply to open cookie - legacy interfacing
  cmn.writeToCookie( req, res, 'refresh', true );
  cmn.writeToCookie( req, res, 'logged', true );
  //--------------

  _updateRedisSession( req, res, user, cb );

}

function unset( req, res, cb ) {

  req.session = null;

  _removeSymfonyCookie( res );

  // --- apply to open cookie - legacy interfacing
  cmn.writeToCookie( req, res, 'refresh', true );
  cmn.writeToCookie( req, res, 'logged', false );
  //--------------

  _clearRedisSession( req, res, cb );

}

function _removeSymfonyCookie( res ) {

  res.clearCookie( config.session.sfName );

}

function syncRedis( req, res, cb ) {

  if ( cmn.isLogged( req ) ) {

    model.users().get( { id: req.session.userId }, function( err, user ) {

      if ( err ) {

        req.log( 'failed to sync redis' );

        if ( cb ) cb( err );

        return;

      }

      if ( !user ) {

        _clearRedisSession( req, res, cb );

      } else {

        _updateRedisSession( req, res, user, cb );

      }

    } );

  } else {

    _clearRedisSession( req, res, cb );

  }

}

function _updateRedisSession( req, res, user, cb ) {

  var cli = redis.createClient( config.redis.port, config.redis.host ),
  
  sessionCookieValue,

  key;

  req.session.save();

  sessionCookieValue = _extractSetCookie( res, config.session.name );

  key = config.session.storePrefix + sessionCookieValue;

  req.log( 'registering session in redis at key %s for user %s', key, user.id );

  cli.set( config.session.storePrefix + sessionCookieValue, JSON.stringify( {
    id: user.id,
    lang: user.culture
  } ), function( err ) {

    cli.quit();

    if ( cb ) cb( err );

  } );

}

function _clearRedisSession( req, res, cb ) {

  var cli = redis.createClient( config.redis.port, config.redis.host ),

  sessionCookieValue = req.cookies[ config.session.name ];

  cli.del( config.session.storePrefix + sessionCookieValue, function( err ) {

    cli.quit();

    if ( cb ) cb( err );

  });

}

function _extractSetCookie( res, name ) {

  var cookieEntries = {};

  res.get( 'Set-Cookie' ).forEach( function( v ) {

    var splitPos = v.indexOf( '=' );

    if ( splitPos == -1 ) return;

    cookieEntries[ v.substr( 0, splitPos ) ] = v.substr( splitPos + 1 ).split( ';' )[ 0 ];

  });

  return cookieEntries[ name ];

}