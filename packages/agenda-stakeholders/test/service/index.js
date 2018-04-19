"use strict";

// proxy function for service in a test env. Init does service init as well as fixture loading.

const svc = require( '../../src/service' ),

  fixtures = require( './fixtures' ),

  _ = require( 'lodash' );

module.exports = svc;

module.exports.initAndLoad = function( config, files, options, cb ) {

  const defautFiles = [
    'agenda',
    'event',
    'stakeholder',
    'agenda_event',
    'stakeholder_settings'
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
  
  fixtures( config, files, options, err => {

    if ( err ) return cb( err );

    svc.init( config, cb );

  } );


}