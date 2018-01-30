"use strict";

const _ = require( 'lodash' );
const logger = require( '@openagenda/logs' );
const middleware = require( '../middleware' );
const isoConfig = require( '../../iso/config' );
const cookieValidate = require( '../../iso/cookie.validate' );
const expressCookie = require( './expressCookie' );
const serviceConfig = require( './config' );
const get = require( './get' );
const open = require( './open' );
const close = require( './close' );
const scan = require( './scan' );
const sync = require( './sync' );
const helpers = require( './helpers/index' );

let config, interfaces;

let log = console.log;

module.exports = {
  init,
  shutdown,
  open,
  get,
  scan,
  sync,
  close,
  setFlash: ( req, res, message ) => set( config.writableCookie.name, req, res, 'flash', message ),
  setCulture: ( req, res, culture ) => set( config.sessionCookie.name, req, res, 'user.culture', culture ),
  isLogged,
  getCulture,
  middleware
}

function set( cookieName, request, response, name, value ) {

  expressCookie( cookieName, request, response ).set( name, value );

}


async function isLogged( request ) {

  let user = await get.promise( request );

  return !!user;

}

function getCulture( request ) {

  try {

    let user = cookieValidate( request.session ).user;

    if ( user ) return user.culture;

  } catch ( e ) {
    console.log( e );
  }

  return null;

}


function init( c ) {

  serviceConfig.init( c );

  config = c;

  config.sessionCookie = _.extend( {}, c.sessionCookie, {
    name: isoConfig.cookies.session
  } );

  config.writableCookie = _.extend( {}, c.writableCookie, {
    name: isoConfig.cookies.writable
  } );

  if ( c.logger ) {

    logger.setModuleConfig( c.logger );

  }

  helpers.init();

  [ get, open, close, sync, scan ].forEach( end => {

    if ( end.init ) end.init();

  } );

  log = logger( 'sessions' );

  interfaces = c.interfaces;

  middleware.init( config, module.exports );

  expressCookie.init( config );

}

function shutdown( c ) {

  helpers.shutdown();

}