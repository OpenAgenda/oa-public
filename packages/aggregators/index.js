"use strict";

const _ = require( 'lodash' );

module.exports = _.extend( require( './lib/aggregators' ), {
  utils: {
    evaluateRules: require( './lib/rules' )
  },
  sources: require( './lib/sources' ),
  resync: require( './lib/resync' ),
  init: require( './lib/config' ).init,
  createInstance: require('./Aggregators')
} );
