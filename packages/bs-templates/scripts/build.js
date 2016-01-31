"use strict";

var fs = require( 'fs' ),

async = require( 'async' ),

sassify = require( './sassify' );

fs.readdir( __dirname + '/../', ( err, files ) => {

  async.each( files, sassify, err => {

    console.log( 'done' );

  } );

} );