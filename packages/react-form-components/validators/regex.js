"use strict";

var utils = require( 'utils' );

module.exports = function( config ) {

  var params = utils.extend( {
    regex: false, // required
    error: { // replace with something more specific
      code: 'regex.mismatch',
      message: 'regex does not match'
    },
    trim: true
  }, config );

  return function( value ) {

    var clean = ( value + '' );

    if ( params.trim ) {

      clean = clean.trim();

    }

    if ( !params.regex.test( clean ) ) {

      throw [ utils.extend( {
        origin: clean
      }, params.error ) ];

    }

    return clean;

  }

}