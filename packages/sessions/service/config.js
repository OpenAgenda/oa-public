"use strict";

const _ = require( 'lodash' );
const logger = require( 'basic-logger' );
const isoConfig = require( '../iso/config' );


const config = {
  initialized: false,
  sessionCookie: null,
  writableCookie: null,
  redis: null,
  interfaces: {}
};

module.exports = _.extend( config, { init } );

function init( c ) {

  _.extend( config, _.pick( c, [ 
    'sessionCookie', 
    'writableCookie',
    'redis',
    'interfaces'
  ] ) );

  _.extend( config.sessionCookie, {
    name: isoConfig.cookies.session
  } );

  _.extend( config.writableCookie, {
    name: isoConfig.cookies.writable
  } );

  if ( c.logger ) {

    logger.setLogger( c.logger );

  }

  config.initialized = true;

}
