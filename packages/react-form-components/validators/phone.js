"use strict";

var rgx = require( './regex' );

module.exports = function() {

  return rgx( {
    regex: /^(\+|)\d+$/,
    error: {
      code: 'phone.invalid',
      message: 'value is not a phone number'
    }
  } );

}