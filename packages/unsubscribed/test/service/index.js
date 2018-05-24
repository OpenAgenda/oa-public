"use strict";

const svc = require( '../../' ),

  fixtures = require( './fixtures' ),

  _ = require( 'lodash' );

module.exports = svc;

module.exports.initAndLoad = function( config, files, options, cb ) {

  const defautFiles = [
    'unsubscribed',
  ];

  if ( arguments.length === 3 && Array.isArray( arguments[ 1 ] ) ) {

    cb = options;

    options = { reset: true };

  } else if ( arguments.length === 3 ) {

    cb = options;

    options = files;

    files = defautFiles;

  } else if ( arguments.length === 2 ) {

    cb = files;

    options = { reset: true };

    files = defautFiles;

  }

  const params = Object.assign( {
    reset: true
  }, options );

  svc.init( config );

  fixtures( config, files, params, cb );

}