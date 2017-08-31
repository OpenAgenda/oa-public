"use strict";

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if ( process.env.NODE_ENV === 'production' ) require( 'newrelic' );

var enabledTypes = ( process.argv ? process.argv : [] ).filter( function ( argItem ) {

  return [ 'web', 'admin', 'task' ].indexOf( argItem ) !== -1;

} );

global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

require( './app' )( enabledTypes );