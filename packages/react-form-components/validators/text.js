"use strict";

var utils = require( 'utils' );

module.exports = function( config ) {

  var params = utils.extend( {
    field: false, // required
    min: 0,
    max: 1000000,
    trim: true,
  }, config || {} );

  return function( value ) {

    var clean = value ? value + '' : '';

    if ( typeof value == 'object' && clean ) {

      // there is something there and it is not a string

      throw [ {
        field: params.field,
        code: 'string.invalidtype',
        message: 'not a string',
        origin: value
      } ]

    }

    if ( params.trim ) {

      clean = clean.trim();

    }

    if ( clean.length < params.min ) {

      throw [ {
        field: params.field,
        code: 'string.tooshort',
        message: 'the string is too short',
        values: {
          min: params.min,
          max: params.max
        },
        origin: value
      } ];

    }

    if ( clean.length > params.max ) {

      throw [ {
        field: params.field,
        code: 'string.toolong',
        message: 'the string is too long',
        values: {
          min: params.min,
          max: params.max
        },
        origin: value
      } ];

    }

    return clean;

  }

}