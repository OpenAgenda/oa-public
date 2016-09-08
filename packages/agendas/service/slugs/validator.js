"use strict";

var utils = require( 'utils' ),

rgx = require( 'validators/regex' );

module.exports = function( config ) {
  
  return rgx( utils.extend( {
    regex: /^[a-z0-9\-_]+$/,
    optional: false,
    field: undefined,
    error: {
      code: 'slug.invalid',
      message: 'only small case characters, numbers or dashes are allowed'
    },
    type: 'slug'
  }, config || {} ) );

}