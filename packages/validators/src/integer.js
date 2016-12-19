"use strict";

import _ from 'lodash/core';
import numberValidator from './number';

export default config => {

  const params = _.extend( {
    field: false,
    optional: true,
    min: null,
    max: null,
    default: null
  }, config || {} );

  const validateNumber = numberValidator( params );

  return _.extend( value => {

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

      throw [ _.extend( {
        code: 'integer.invalid',
        message: 'not an integer',
        origin: value
      }, params.field ? { field: params.field } : {} ) ];

    }

    return clean;

  }, {
    type: 'integer',
    field: params.field
  } );

}