"use strict";

var ejs = require( 'ejs' ),

fs = require( 'fs' );

module.exports = function( path ) {

  return ejs.render( fs.readFileSync( path ).toString(), {
    filename: path
  } );

}