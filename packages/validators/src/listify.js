"use strict";

import utils from 'utils';

/**
 * makes validator process lists
 */

module.exports = ( validator, options ) => {

  const params = utils.extend( {
    min: null,
    max: null,
    optional: !!options.optional
  }, options.list );

  return utils.extend( validate, {
    type: validator.type,
    field: validator.field
  } );

  function validate( v ) {

    let clean = [], errors = [],

    value = v === undefined ? [] : v;

    if ( !utils.isArray( value ) ) {

      throw [ {
        field: validator.field,
        code: 'list.wrongtype',
        message: 'value should be a list',
        origin: value
      } ];

    }

    value.forEach( ( item, i ) => {

      try {

        clean.push( validator( item ) );

      } catch( errs ) {

        errors = errors.concat( errs.map( e => utils.extend( e, { index: i } ) ) );

      }

    } );

    if ( !params.optional && value.length === 0 ) {

      errors.push( {
        field: validator.field,
        code: 'list.required',
        message: 'list cannot be empty',
        origin: value
      } );

    }

    if (
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