"use strict";

var fs = require( 'fs' ),

async = require( 'async' ),

sassify = require( './sassify' ),

ignores = [ '.git', 'node_modules', 'scripts' ];

fs.readdir( __dirname + '/../', ( err, folders ) => {

  async.eachSeries( folders, ( folder, ecb ) => {

    if ( ignores.indexOf( folder ) !== -1 ) return ecb();

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