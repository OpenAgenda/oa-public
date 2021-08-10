"use strict";

var fs = require( 'fs' ),

async = require( 'async' ),

sassify = require( './sassify' );

fs.readdir( __dirname + '/../compiled', ( err, files ) => {

  async.each( files.map( f => __dirname + '/../compiled/' + f ), sassify, err => {

    console.log( 'done' );

  } );

} );