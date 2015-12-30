"use strict";

var sass = require( 'node-sass' ),

fs = require( 'fs' ),

colors = require( 'colors' );

module.exports = function( filename, cb ) {

  if ( !/\.scss$/.test( filename ) ) return cb ? cb() : null;

  sass.render( {
    file: filename,
    includePaths: [ __dirname + '/../' ]
  }, ( err, result ) => {

    if ( err ) {

      console.log( filename.yellow + ': ' + err.message.red );

      return cb ? cb( err ) : null;

    }

    fs.writeFile( filename.replace( '.scss', '.css' ), result.css.toString(), cb ? cb : () => {} );

  } );

}