"use strict";

// proxy function for service in a test env. Init does service init as well as fixture loading.

const svc = require( '../../' ),

  fixtures = require( './fixtures' ),

  _ = require( 'lodash' );

module.exports = svc;

module.exports.initAndLoad = function( config, files, cb ) {

  if ( arguments.length === 2 ) {

    cb = files;

    files = [ 
      'agenda',
      'event',
      'stakeholder',
      'agenda_event',
      'stakeholder_settings'
    ]

  }

  svc.init( config, err => {

    if ( err ) return cb( err );

    fixtures( config, files, cb );

  } );

}