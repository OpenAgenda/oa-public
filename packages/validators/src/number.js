"use strict";

const _ = {
  extend: require( 'lodash/extend' )
}

/*
integer: require( 'react-form-components/validators/integer' )
state: validators.integer( { field: 'state', min: 0, max: 1, default: 1 } )
*/

module.exports = config => {

  const params = _.extend( {
    field: false, // required
    min: null, // minus infinity if defined
    max: null, // infinity and beyond?
    default: undefined, // if set, no input cleans to this
    optional: true
  }, config || {} );

  return _.extend( validate, {
    type: 'number',
    field: params.field
  } );

  function validate( value ) {

    let clean;

    if ( typeof value == 'string' && value.length ) {

      clean = parseFloat( value, 10 );

    } else if ( typeof value === 'number' ) {

      clean = value;

    }

    // we have a clean value, we can check if it fits
    // in what we want.

    if ( clean === undefined && params.default !== undefined ) {

      return params.default;

    }

    if ( clean === undefined && params.optional ) {

      return null;

    }

    if ( clean === undefined && !params.optional ) {

      throw [ _.extend( {
        code: 'required',
        message: 'a number is required',
        origin: value
      }, params.field ? { field: params.field } : {} ) ];

    }

    if ( isNaN( clean ) ) {

      throw [ _.extend( {
        code: 'number.invalid',
        message: 'not a number',
        origin: value
      }, params.field ? { field: params.field } : {} ) ];

    }

    if ( params.min !== null && clean < params.min ) {

      throw [ _.extend( {
        code: 'number.toosmall',
        message: 'the number is too small',
        values: {
          min: params.min
        },
        origin: value
      }, params.field ? { field: params.field } : {} ) ];

    }

    if ( params.max !== null && clean > params.max ) {

      throw [ _.extend( {
        code: 'number.toobig',
        message: 'the number is too big',
        values: {
          max: params.max
        },
        origin: value
      }, params.field ? { field: params.field } : {} ) ];

    }

    return clean;

  }

}