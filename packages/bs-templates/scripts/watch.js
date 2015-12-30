"use strict";

var watch = require( 'node-watch' ),

sassify = require( './sassify' );

watch( __dirname + '/../', ( filename ) => {

  if ( !/\.scss$/.test( filename ) ) return;

  sassify( filename );

} );