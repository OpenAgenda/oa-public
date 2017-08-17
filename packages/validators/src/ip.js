"use strict";

import listify from './listify';
import extend from 'lodash/extend';
import isIP from 'validator/lib/isIP';

export default config => {

  const params = extend( {
    field: false,
    optional: false,
    default: undefined,
    list: false
  }, config || {} ),

    ipValidator = extend( validate, {
      type: 'ip',
      field: params.field
    } );

  return params.list ? listify( ipValidator, params ) : ipValidator;

  function validate( value ) {

    let clean = null, 

      error = {
        origin: value,
        field: params.field
      };

    if ( value === undefined && ( params.default !== undefined || params.optional ) ) {

      return params.default;

    } else if ( value === undefined ) {

      return [ extend( error, { 
        code: 'ip.required',
        message: 'an ip address is required'
      } ) ];

    }

    if ( !isIP( value ) ) {

      throw [ extend( error, {
        code: 'ip.invalid',
        message: 'ip address is invalid'
      } ) ];

    }

    return value;

  }

}