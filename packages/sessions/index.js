"use strict";

const middleware = require( './middleware' );
const isoConfig = require( './iso/config' );
const validate = require( './service/validate' );
const expressCookie = require( './service/expressCookie' );
const cookieValidate = require( './iso/cookie.validate' );
const logger = require( '@openagenda/logs' );
const _ = require( 'lodash' );
const w = require( 'when' );
const redis = require( 'redis' );
const parseListArguments = require( '@openagenda/service-utils/parseListArguments' );
const serviceConfig = require( './service/config' );
const get = require( './service/get' );
const open = require( './service/open' );
const close = require( './service/close' );
const scan = require( './service/scan' );
const sync = require( './service/sync' );
const helpers = require( './service/helpers' );

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
  setFlash,
  isLogged,
  getCulture,
  middleware
}


function setFlash( request, response, message ) {

  expressCookie( config.writableCookie.name, request, response ).set( 'flash', message );

}


async function isLogged( request ) {

  let user = await get.promise( request );

  return !!user;

}

function getCulture( request ) {

  try {

    let user = cookieValidate( request.session ).user;

    if ( user ) return user.culture;

  } catch( e ) { console.log( e ); }

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