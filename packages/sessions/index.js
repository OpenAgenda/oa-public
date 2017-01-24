"use strict";

const middleware = require( './middleware' );
const isoConfig = require( './iso/config' );
const validate = require( './service/validate' );
const expressCookie = require( './service/expressCookie' );
const cookieValidate = require( './iso/cookie.validate' );
const _ = require( 'lodash' );
const w = require( 'when' );
const redis = require( 'redis' );
const parseListArguments = require( 'service-utils/parseListArguments' );

let config, interfaces;

module.exports = {
  init,
  open,
  get,
  scan,
  sync,
  close,
  setFlash,
  isLogged,
  middleware
}


function setFlash( request, response, message ) {

  // this guy needs to handle a cookie.
  request.session.flash = message;

  // this guy needs request and response.
  expressCookie( request, response, config.writableCookie.name ).set( 'flash', message );

}


function open( request, identifier, cb ) {

  if ( !config ) return cb( 'service has not been initialized' );

  w( {
    request,
    identifier,
    user: null,
    result: {
      success: false,
      data: null,
      cookieData: null,
      errors: []
    }
  } )

  .then( _getUser )

  .then( _validateSessionData )

  .then( _storeSessionData )

  .then( _extractCookieData )

  .done( v => cb( null, v.result ), cb );

}


function sync( request, cb ) {

  if ( !config ) return cb( 'service has not been initialized' );

  get( request, ( err, user ) => {

    if ( err ) return cb( err );

    if ( !user ) {

      return cb( null, {
        success: false,
        errors: [ {
          code: 'session.notfound'
        } ]
      } );

    }

    open( request, { uid: user.uid }, cb );

  } );

}

function scan( cursor, count, options, cb ) {

  if ( arguments.length == 3 ) {

    options = {};
    cb = arguments[ 2 ];

  } else if ( arguments.length == 2 ) {

    count = 10;
    options = {};
    cb = arguments[ 1 ];

  }

  let cli = redis.createClient( config.redis.port, config.redis.host );

  cli.hscan( config.redis.hash, cursor, 'count', count, ( err, result ) => {

    cli.quit();

    if ( err ) return cb( err );

    cb( null, result[ 1 ]
      .filter( ( r, i ) => i % 2 !== 0 )
      .map( JSON.parse ),
      parseInt( result[ 0 ] ) );

  } );

}


function get( uidOrRequest, options, cb ) {

  if ( !config ) return cb( 'service has not been initialized' );

  if ( arguments.length === 2 ) {

    cb = arguments[ 1 ];
    options = {}

  }

  const params = _.extend( {
    detailed: false
  }, options );

  const uidGet = !( _.isObject( uidOrRequest ) && uidOrRequest.cookies );

  w( {
    request: uidGet ? null : uidOrRequest,
    uid: uidGet ? uidOrRequest : null,
    result: {
      errors: [],
      data: null
    } // the complete session data
  } )

  .then( _loadCookieSessionData )

  .then( params.detailed || uidGet ? _mergeStoredData : v => v )

  .done( v => {

    if ( !v.result.data ) return cb( null, null );

    // when a get by uid is made, data comes full from store. needs to be filtered if details were not required
    let clean = !params.detailed && v.result.data.id ? cookieValidate( { user: v.result.data } ).user : v.result.data;

    cb( null, clean );

  }, cb );

}


function isLogged( request ) {

  try {

    return !!cookieValidate( request.session ).user;

  } catch( e ) { console.log( e );}

  return false;

}


function close( request, cb ) {

  if ( !config ) return cb( 'service has not been initialized' );

  w( {
    request,
    uid: request.uid,
    result: {
      success: false,
      errors: []
    }
  } )

  .then( _loadCookieSessionData )

  .then( _removeFromStore )

  .then( _clearRequest )

  .done( v => {

    v.result.success = !v.result.errors.length;

    cb( null, v.result );

  } );

}

function _extractSession( v ) {

  let d = w.defer();

  middleware( v.request, {}, err => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } )

  return d.promise;

}

function _clearRequest( v ) {

  if ( v.result.errors.length ) return v;

  v.request.session = null;

  return v;

}


function _mergeStoredData( v ) {

  if ( v.result.errors.length || !v.uid ) return v;

  let d = w.defer(),

    cli = redis.createClient( config.redis.port, config.redis.host );

  cli.hget( config.redis.hash, v.uid, ( err, result ) => {

    cli.quit();

    if ( err ) return d.reject( err );

    if ( !result ) return d.resolve( v );

    try {

      v.result.data = _.extend( v.result.data || {}, JSON.parse( result ) );

    } catch ( e ) {}

    d.resolve( v );

  } );

  return d.promise;

}


function _loadCookieSessionData( v ) {

  if ( v.result.errors.length ) return v;

  let data = v.request ? _cleanSession( v.request.session ).user : null;

  if ( !data ) return v;

  v.result.data = data;

  v.uid = v.result.data.uid;

  return v;

}


function _removeFromStore( v ) {

  if ( v.result.errors.length ) return v;

  let { uid } = v;

  let d = w.defer(),

    cli = redis.createClient( config.redis.port, config.redis.host );

  cli.hdel( config.redis.hash, uid, ( err, result ) => {

    cli.quit();

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

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
function _cleanSession( session = {}, data = {} ) {

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

    cli = redis.createClient( config.redis.port, config.redis.host );

  cli.hset( config.redis.hash, user.uid, JSON.stringify( result.data ), ( err, result ) => {

    cli.quit();

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}


function _getRedisKey( uid ) {

  return config.redis.hash + uid;

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
    name: isoConfig.cookies.session
  } );

  config.writableCookie = _.extend( {}, c.writableCookie, {
    name: isoConfig.cookies.writable
  } );

  interfaces = c.interfaces;

  middleware.init( config, module.exports );

  expressCookie.init( config );

}