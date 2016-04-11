"use strict";

const svc = require( './' ),

fixtures = require( '../test/fixtures' ),

utils = require( 'utils' );

module.exports = utils.extend( svc, {
  test: {
    fixtures: _fixtures
  }
} );

function _fixtures( cb ) {

  fixtures.init( svc.getConfig() );

  fixtures( cb );

}