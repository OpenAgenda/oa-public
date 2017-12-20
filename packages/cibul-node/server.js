"use strict";

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var enabledTypes = ( process.argv ? process.argv : [] ).filter( function ( argItem ) {

  return [ 'web', 'admin', 'task' ].indexOf( argItem ) !== -1;

} );

require( './app' )( enabledTypes );