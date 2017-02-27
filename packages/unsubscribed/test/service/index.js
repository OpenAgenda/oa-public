"use strict";

const svc = require( '../../' ),

  fixtures = require( './fixtures' ),

  _ = require( 'lodash' );

module.exports = svc;

module.exports.initAndLoad = function( config, files, options, cb ) {

  const defautFiles = [
    'unsubscribed',
  ];

  if ( arguments.length === 3 ) {

    cb = options;

    options = files;

    files = defautFiles;

  } else if ( arguments.length === 2 ) {

    cb = files;

    options = { reset: true };

    files = defautFiles;

  }

  svc.init( config )

  fixtures( config, files, options, cb );

}