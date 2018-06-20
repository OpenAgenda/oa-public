"use strict";

import numberValidator from './number';
import extend from 'lodash/extend';
import listify from './listify';

export default config => {

  const params = extend( {
    field: false,
    optional: true,
    min: null,
    max: null,
    default: null,
    list: false
  }, config || {} ),

  validateNumber = numberValidator( params ),

  integerValidator = extend( validate, {
    type: 'integer',
    field: params.field
  } );

  return params.list ? listify( integerValidator, params ) : integerValidator;

  function validate( value ) {

    let clean = null, errors = [];

    try {

      clean = validateNumber( value );

    } catch ( e ) {

      errors = e;

    }

    if ( errors.length ) {

      throw errors.map( e => {

        e.code = e.code.replace( 'number', 'integer' );
        e.message = e.message.replace( 'number', 'integer' );

      } );

    }

    if ( clean === null ) {

      return null;

    }

    if ( parseInt( clean ) !== parseFloat( clean ) ) {

      throw [ extend( {
        code: 'integer.invalid',
        message: 'not an integer',
        origin: value
      }, params.field ? { field: params.field } : {} ) ];

    }

    return clean;

  }

}