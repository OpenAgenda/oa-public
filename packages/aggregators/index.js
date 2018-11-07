"use strict";

const _ = require( 'lodash' );

module.exports = _.extend( require( './lib/aggregators' ), {
  utils: {
    rules: require( './lib/rules' )
  },
  sources: require( './lib/sources' ),
  resync: require( './lib/resync' ),
  init: require( './lib/config' ).init,
  notify: require( './lib/notify' )
} );
