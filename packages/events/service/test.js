"use strict";

const svc = require( '../' ),

fixtures = require( '../test/fixtures' ),

utils = require( 'utils' );

module.exports = utils.extend( svc, {
  test: {
    fixtures: function( tables, cb ) {

      if ( arguments.length === 1 ) {

        cb = tables;
        tables = [ 'event' ];

      }

      fixtures( svc.getConfig(), tables, cb );

    }
  }
} );