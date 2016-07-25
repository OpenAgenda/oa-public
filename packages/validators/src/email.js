"use strict";

import utils from 'utils'

const emailRgx = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;

export default config => {

  let params = utils.extend( {
    field: undefined,
    error: {
      code: 'email.invalid',
      message: 'email is not valid'
    },
    type: 'email'
  }, config || {} );

  return utils.extend( validate, {
    type: 'email',
    field: params.field
  } );

  function validate( value ) {

    let clean = typeof value === 'string' ? value.trim() : '';

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