"use strict";

const svc = require( './' ),

fixtures = require( '../test/fixtures' ),

utils = require( 'utils' );

module.exports = utils.extend( svc, {
  test: {
    fixtures: _fixtures
  }
} );

function _fixtures( options, cb ) {

  if (arguments.length === 1) {

    cb = options;
    options = {};
    
  }

  fixtures.init( svc.getConfig() );

  fixtures( options, cb );

}