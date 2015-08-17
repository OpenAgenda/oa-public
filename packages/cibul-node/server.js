"use strict";

require( 'newrelic' );

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

var enabledTypes = ( process.argv ? process.argv : [] ).filter( function( argItem ) {

  return [ 'web', 'admin', 'task' ].indexOf( argItem ) !== -1;

});

require( './app' )( enabledTypes );