"use strict";

const segmentPages = require( './segment-pages' );

const fs = require( 'fs' );

const _ = require( 'lodash' );

const labels = require( '@openagenda/labels/corpo/pages' );

// let german be english when undefined
_.keys( labels ).forEach( k => labels[ k ].de = labels[ k ].de || labels[ k ].en );

module.exports = function( basePath ) {

  const params = {
    templates: {},
    pages: [],
    segments: [],
    labels,
    basePath,
    baseDir: __dirname + '/templates',
    throwOnUnknown: false
  }

  fs.readdirSync( __dirname + '/templates' ).map( f => {

    params.templates[ f.split( '.' )[ 0 ] ] = fs.readFileSync( __dirname + '/templates/' + f, 'utf-8' );

  } );

  [ 'pages', 'segments' ].forEach( namespace => {

    fs.readdirSync( __dirname + '/' + namespace ).map( p => {

      params[ namespace ].push( _.assign( {
        key: p.split( '.' )[ 0 ]
      }, JSON.parse( fs.readFileSync( __dirname + '/' + namespace + '/' + p, 'utf-8' ) ) ) );

    } );

  } );

  return segmentPages( params );

}
