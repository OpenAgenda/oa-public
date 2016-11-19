"use strict";

import utils from 'utils';
import listify from './listify';

module.exports = function( config ) {

  const params = utils.extend( {
    field: false, // required
    min: 0,
    max: 1000000,
    trim: true,
    optional: true,
    default: null,
    list: false
  }, config || {} ),

  validator = utils.extend( validate, {
    type: 'text',
    field: params.field
  } );

  return params.list ? listify( validator, params.list ) : validator;

  function validate( value ) {

    var clean = value ? value + '' : '';

    if ( typeof value == 'object' && clean ) {

      // there is something there and it is not a string

      throw [ {
        field: validate.field,
        code: 'string.invalidtype',
        message: 'not a string',
        origin: value
      } ]

    }

    if ( params.trim ) {

      clean = clean.trim();

    }

    if ( typeof value === 'undefined' || value === null || !clean.length ) {

      if ( params.optional || params.default !== null ) return params.default;

      throw [ {
        field: validate.field,
        code: 'required',
        message: 'a string is required',
        origin: value
      } ];

    }

    if ( clean.length < params.min ) {

      throw [ {
        field: validate.field,
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
        field: validate.field,
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