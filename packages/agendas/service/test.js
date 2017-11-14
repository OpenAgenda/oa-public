"use strict";

const svc = require( './' ),

fixtures = require( '../test/fixtures' ),

utils = require( '@openagenda/utils' );

module.exports = utils.extend( svc, {
  test: {
    fixtures: _fixtures
  }
} );

function _fixtures( files, options, cb ) {

  const defautFiles = [
    'agenda',
    'agenda_event',
    'occurrence',
    'legacy_credential_set'
  ];

  if (arguments.length === 2) {

    cb = options;
    options = files;
    files = defautFiles;
    
  } else if (arguments.length === 1) {

    cb = files;
    options = {};
    files = defautFiles;

  }

  fixtures.init( svc.getConfig() );

  fixtures( files, options, cb );

}