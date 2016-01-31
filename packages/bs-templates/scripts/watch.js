"use strict";

var watch = require( 'node-watch' ),

sassify = require( './sassify' ),

ejs = require( 'ejs' ),

fs = require( 'fs' );

watch( __dirname + '/../', ( filename ) => {

  if ( /^[^_].+\.ejs$/.test( filename ) ) {

    _buildHTML( filename );

  } else if ( /\.scss$/.test( filename ) ) {

    sassify( filename );

  }

} );

function _buildHTML( filename ) {

  var str = ejs.render( fs.readFileSync( filename ).toString(), {
    filename: filename
  } );

  fs.writeFileSync( filename.replace( '.ejs', '.html' ), str );

}