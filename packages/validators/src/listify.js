"use strict";

import extend from 'lodash/extend';
import isArray from 'lodash/isArray';

/**
 * makes validator process lists
 */

module.exports = ( validator, options ) => {

  const params = extend( {
    min: null,
    max: null,
    optional: options.optional === undefined ? true : !!options.optional
  }, options.list );

  return extend( validate, {
    type: validator.type,
    field: validator.field
  } );

  function validate( v ) {

    let clean = [], errors = [],

    value = [ undefined, null ].includes( v ) ? [] : v;

    if ( v === undefined && ( params.default !== undefined ) ) {

      return params.default;

    }

    if ( !isArray( value ) ) {

      value = [ value ];

    }

    value.forEach( ( item, i ) => {

      try {

        clean.push( validator( item ) );

      } catch( errs ) {

        errors = errors.concat( errs.map( e => extend( e, { index: i } ) ) );

      }

    } );

    if ( !params.optional && value.length === 0 ) {

      errors.push( {
        field: validator.field,
        code: 'list.required',
        message: 'list cannot be empty',
        origin: value
      } );

    } else if (
      ( !params.optional || value.length > 0 )
      && params.min !== null
      && value.length < params.min
    ) {

      errors.push( {
        field: validator.field,
        code: 'list.tooshort',
        message: 'list is too short',
        origin: value
      } );

    }

    if ( params.max !== null && value.length > params.max ) {

      errors.push( {
        field: validator.field,
        code: 'list.toolong',
        message: 'list is too long',
        origin: value
      } );

    }

    if ( errors.length ) throw errors;

    return clean;

  }

}