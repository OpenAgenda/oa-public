"use strict";

var rgx = require( './regex' );

module.exports = function( config ) {

  return rgx( {
    optional: config ? config.optional : false,
    field: config ? config.field : undefined,
    regex: /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i,
    error: {
      code: 'email.invalid',
      message: 'email is not valid'
    },
    type: 'email'
  } );

}