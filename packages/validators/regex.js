"use strict";

var utils = require( 'utils' );

module.exports = function( config ) {

  var params = utils.extend( {
    optional: false,
    field: false, // required
    regex: false, // required
    error: { // replace with something more specific
      code: 'regex.mismatch',
      message: 'regex does not match'
    },
    clean: false, // if true result of regex is clean value
    trim: true,
    type: false
  }, config || {} ),

  validator = function( value ) {

    var clean = value ? ( value + '' ) : null;

    if ( params.optional && ( !clean || !clean.length ) ) {

      return clean;

    }

    if ( !params.optional && !clean ) {

      throw [ {
        origin: value,
        field: params.field,
        code: 'required',
        message: 'value must not be empty'
      } ];

    }

    if ( typeof clean == 'string' && params.trim ) {

      clean = clean.trim();

    }

    if ( !params.regex.test( clean ) ) {

      throw [ utils.extend( {
        origin: value,
        field: params.field
      }, params.error ) ];

    }

    return params.clean ? clean.match( params.regex )[ 0 ] : clean;

  };

  if ( params.type ) {

    validator.type = params.type;

  }

  if ( params.field ) {

    validator.field = params.field;

  }

  return validator;

}