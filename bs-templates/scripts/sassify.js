"use strict";

const path = require( 'path' );
const fs = require( 'fs' );
const sass = require( 'sass' );

module.exports = createCss;

module.exports.render = render;

function isInOA() {
  try {
    const packageJson = require('../../../package.json');

    if (packageJson.name === 'oa') {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function createCss( filename, cb ) {

  if ( !/\.scss$/.test( filename ) ) return cb ? cb() : null;

  render( filename, ( err, rendered ) => {

    if ( err ) {

      console.log( filename + ': ' + err.formatted );

      return cb ? cb( err ) : null;

    }

    fs.writeFile( filename.replace( '.scss', '.css' ), rendered, cb ? cb : () => {
    } );

  } );

}

function avoidError(fn, ...args) {
  try {
    return fn(...args);
  } catch (e) {
    return null;
  }
}

function render( filename, cb ) {

  console.log( filename );

  const includePaths = [
      path.resolve(__dirname, '..'),                      // bs-templates
      path.resolve(__dirname, '../node_modules'),         // bs-templates node_modules
      path.resolve(__dirname, '../../node_modules'),      // public root node_modules
    ].concat(isInOA() ? [
      path.resolve(__dirname, '../../../node_modules'),    // oa root node_modules
    ] : []);

  sass.render( {
    file: filename,
    includePaths,
    outputStyle: process.env.NODE_ENV === 'production' ? 'compressed' : 'expanded'
  }, ( err, result ) => {

    if ( err ) return cb( err );

    cb( null, result.css.toString() );

  } );

}
