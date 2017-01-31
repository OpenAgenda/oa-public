"use strict";

import extend from 'lodash/extend';
import listify from './listify';

const emailRgx = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;

export default config => {

  const params = extend( {
    field: undefined,
    error: {
      code: 'email.invalid',
      message: 'email is not valid'
    },
    optional: true,
    type: 'email'
  }, config || {} ),

  validator = extend( validate, {
    type: 'email',
    field: params.field
  } );

  return params.list ? listify( validator, params ) : validator;

  function validate( value ) {

    let clean = typeof value === 'string' ? value.trim() : '';

    if ( !value && params.optional ) {

      return null;

    }

    if ( clean.indexOf( ' ' ) !== -1 || !emailRgx.test( clean ) ) {

      throw [ {
        field: params.field,
        code: params.error.code,
        message: params.error.message,
        origin: value
      } ];      

    } 

    return clean;

  }

}