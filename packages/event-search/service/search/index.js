"use strict";

const _ = require( 'lodash' );

module.exports = _.extend( require( './search' ), {
  scroll: require( './scroll' ),
  stream: require( './stream' )
} );