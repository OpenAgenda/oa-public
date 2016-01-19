"use strict";

var rgx = require( './regex' );

module.exports = function( config ) {

  return rgx( {
    field: config.field,
    regex: /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i,
    error: {
      code: 'email.invalid',
      message: 'email is not valid'
    }
  } );

}