"use strict";

var rgx = require( './regex' );

module.exports = function( config ) {

  return rgx( {
    field: config.field,
    regex: /^(\+|)\d+$/,
    error: {
      code: 'phone.invalid',
      message: 'value is not a phone number'
    }
  } );

}