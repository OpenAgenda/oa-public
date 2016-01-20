"use strict";

var utils = require( 'utils' );

module.exports = function( config ) {

  var params = utils.extend( {
    field: false, // required
    regex: false, // required
    error: { // replace with something more specific
      code: 'regex.mismatch',
      message: 'regex does not match'
    },
    trim: true,
    type: false
  }, config || {} ),

  validator = function( value ) {

    var clean = ( value + '' );

    if ( params.trim ) {

      clean = clean.trim();

    }

    if ( !params.regex.test( clean ) ) {

      throw [ utils.extend( {
        origin: clean,
        field: params.field
      }, params.error ) ];

    }

    return clean;

  };

  if ( params.type ) {

    validator.type = params.type;

  }

  return validator;

}