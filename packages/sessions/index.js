"use strict";

const middleware = require( './middleware' );
const isoConfig = require( './iso/config' );
const validate = require( './service/validate' );
const cookieValidate = require( './iso/cookie.validate' );
const _ = require( 'lodash' );
const w = require( 'when' );
const redis = require( 'redis' );

let config, interfaces;

module.exports = {
  init,
  open,
  get,
  close,
  setFlash,
  middleware
}


function setFlash( request, message ) {

  request.session.flash = message;

}


function open( request, identifier, cb ) {

  if ( !config ) return cb( 'service has not been initialized' );

  w( {
    request,
    identifier,
    user: null,
    code: null,
    result: {
      success: false,
      data: null,
      cookieData: null,
      errors: []
    }
  } )

  .then( _getUser )

  .then( _getSessionCode )

  .then( _validateSessionData )

  .then( _storeSessionData )

  .then( _extractCookieData )

  .done( v => cb( null, v.result ), cb );

}


function get( codeOrRequest, cb ) {

  if ( !config ) return cb( 'service has not been initialized' );

  w( {
    request: _.isObject( codeOrRequest ) && codeOrRequest.session ? codeOrRequest : null,
    code: !_.isObject( codeOrRequest ) ? codeOrRequest : null,
    storedData: null,
    result: {
      errors: [],
      data: null
    } // the complete session data
  } )

  .then( _getSessionCode )

  .then( _getStoredData )

  .then( _mergeCookieData )

  .done( v => cb( null, v.result.data ), cb );

}


function close( request, cb ) {

  if ( !config ) return cb( 'service has not been initialized' );

  w( {
    request,
    code: null,
    result: {
      success: false,
      errors: []
    }
  } )

  .then( _getSessionCode )

  .then( _removeFromStore )

  .then( _clearRequest )

  .done( v => {

    v.result.success = !v.result.errors.length;

    cb( null, v.result );

  } );

}

function _clearRequest( v ) {

  if ( v.result.errors.length ) return v;

  v.request.session = null;

  return v;

}


function _getStoredData( v ) {

  if ( v.result.errors.length ) return v;

  let { code } = v;

  let d = w.defer(),

    cli = redis.createClient( config.redis.port, config.redis.host );

  cli.get( config.redis.prefix + code, ( err, result ) => {

    cli.quit();

    if ( err ) return d.reject( err );

    try {

      v.storedData = JSON.parse( result );

    } catch ( e ) {}

    d.resolve( v );

  } );

  return d.promise;

}


function _mergeCookieData( v ) {

  if ( v.result.errors.length ) return v;

  v.result.data = _.extend( {}, v.storedData, v.request ? _cleanSession( v.request.session ).user : {} );

  return v;

}


function _removeFromStore( v ) {

  if ( v.result.errors.length ) return v;

  let { code } = v;

  let d = w.defer(),

    cli = redis.createClient( config.redis.port, config.redis.host );

  cli.del( config.redis.prefix + code, ( err, result ) => {

    cli.quit();

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}


function _getSessionCode( v ) {

  if ( v.result.errors.length ) return v;

  if ( v.code ) return v;

  v.code = v.request.cookies[ config.sessionCookie.name + '.sig' ];

  if ( !v.code ) {

    v.result.errors.push( {
      code: 'sessionCookie.missing'
    } );

  }

  return v;

}


function _extractCookieData( v ) {

  let { result } = v;

  if ( v.result.errors.length ) return v;

  v.result.cookieData = cookieValidate( { user: v.result.data } );

  _cleanSession( v.request.session, v.result.cookieData );

  v.result.success = true;

  return v;

}


/**
 * strip session data to known and desired values
 */
function _cleanSession( session, data = {} ) {

  let filtered = _.pick( session, Object.keys( session ) ),

  clean = {};

  Object.keys( session ).forEach( k => session[ k ] = undefined );

  try {

    clean = cookieValidate( _.extend( filtered, data ) );

  } catch( e ) { console.log( e ); }

  Object.keys( clean ).forEach( k => session[ k ] = clean[ k ] );

  return session;

}


function _validateSessionData( v ) {

  let { user, code } = v, clean;

  if ( v.result.errors.length ) return v;

  try {

    clean = validate( _.extend( { 
      latestActivity: new Date(),
      code
    }, user ) );

  } catch ( e ) {

    v.result.errors = e;

  }

  v.result.data = clean;

  return v;

}


function _storeSessionData( v ) {

  let { user, result } = v;

  if ( v.result.errors.length ) return v;

  let d = w.defer(),

    cli = redis.createClient( config.redis.port, config.redis.host ),

    redisKey = config.redis.prefix + v.code;

  cli.set( redisKey, JSON.stringify( result.data ), ( err, result ) => {

    cli.quit();

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}


function _getUser( v ) {

  let { identifier } = v,

  d = w.defer();

  interfaces.getUser( identifier, ( err, user ) => {

    if ( err ) return d.reject( err );

    v.user = user;

    if ( user === null ) {

      v.result.errors = [ { code: 'user.notfound' } ];

    }

    d.resolve( v );

  } );

  return d.promise;

}

function init( c ) {

  config = c;

  config.sessionCookie = _.extend( {}, c.sessionCookie, {
    name: isoConfig.cookie
  } );

  interfaces = c.interfaces;

  middleware.init( c, module.exports );

}