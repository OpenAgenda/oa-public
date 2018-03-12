"use strict";

const path = require( 'path' );

const fs = require( 'fs' );

var sass = require( 'node-sass' ),

  importOnce = require( 'node-sass-import-once' ),

  colors = require( 'colors' );

module.exports = createCss;

module.exports.render = render;

function createCss( filename, cb ) {

  if ( !/\.scss$/.test( filename ) ) return cb ? cb() : null;

  render( filename, ( err, rendered ) => {

    if ( err ) {

      console.log( filename.yellow + ': ' + err.message.red );

      return cb ? cb( err ) : null;

    }

    fs.writeFile( filename.replace( '.scss', '.css' ), rendered, cb ? cb : () => {
    } );

  } );

}

function render( filename, cb ) {

  console.log( filename );

  sass.render( {
    file: filename,
    importer: importOnce,
    includePaths: [ path.resolve( __dirname, '..' ), path.resolve( __dirname, '..', 'node_modules' ) ]
  }, ( err, result ) => {

    if ( err ) return cb( err );

    cb( null, result.css.toString() );

  } );

}