"use strict";

const _ = require( 'lodash' );

module.exports = _.extend( require( './search' ), {
  dsl: require( './dsl' ),
  scroll: require( './scroll' ),
  stream: require( './stream' )
} );