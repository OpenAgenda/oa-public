"use strict";

const fs = require( 'fs' );
const path = require( 'path' );

module.exports = getAllLabels();

function getAllLabels() {
  let result = {};
  let files = getLabelsDirectories();

  for ( let file of files ) {

    let branches = path.dirname( file ).split( '/' );
    let currentBranch;
    let currentPos = result;

    while ( currentBranch = branches.shift() ) {

        currentPos[ currentBranch ] = Object.assign(
          currentPos[ currentBranch ] || {},
          { [path.basename( file ).replace( '.js', '' )]: require( './' + file ) }
        );

      currentPos = currentPos[ currentBranch ];

    }

  }

  return result;
}

function getLabelsDirectories() {
  let results = [];
  let files = fs.readdirSync( __dirname );

  for ( let file of files ) {
    let stats = fs.statSync( path.join( __dirname, file ) );

    if ( stats.isDirectory() && !~[ 'node_modules', '.git', '.idea', 'test', 'lib' ].indexOf( file ) ) {
      results = results.concat( walkSync( file ) );
    }
  }

  return results;
}

function walkSync( dir ) {
  let results = [];
  let files = fs.readdirSync( path.join( __dirname, dir ) );

  let i = 0;
  (function next() {
    let file = files[ i++ ];
    if ( !file ) return results;

    file = dir + '/' + file;

    let stat = fs.statSync( path.join( __dirname, file ) );
    if ( stat && stat.isDirectory() ) {
      results = results.concat( walkSync( file ) );
      next();
    } else {
      results.push( file );
      next();
    }
  })();

  return results;
}
