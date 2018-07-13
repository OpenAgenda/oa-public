"use strict";

const rgx = require( './regex' );

module.exports = function( config ) {

  return rgx( {
    optional: config ? config.optional : false,
    field: config ? config.field : undefined,
    regex: /^(\+|)([\d\s\.\-]|\([\d\s]\))+$/,
    error: {
      code: 'phone.invalid',
      message: 'value is not a phone number'
    },
    type: 'phone'
  } );

}