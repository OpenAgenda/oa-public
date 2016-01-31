"use strict";

var fs = require( 'fs' ),

async = require( 'async' ),

sassify = require( './sassify' );

// compile all isolated 

fs.readdir( __dirname + '/../templates', ( err, folders ) => {

  async.eachSeries( folders, ( folder, ecb ) => {

    fs.stat( __dirname + '/../' + folder, ( err, result ) => {

      if ( !result.isDirectory() ) return ecb();

      fs.readdir( __dirname + '/../' + folder, ( err, files ) => {

        async.each( files.map( f => __dirname + '/../' + folder + '/' + f ), sassify, ( err ) => {

          ecb();

        } );

      } );

    } );

  }, ( err ) => { console.log( err ) } );

} );