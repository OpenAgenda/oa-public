"use strict";

var utils = require( 'utils' );

module.exports = function( config ) {

  var params = utils.extend( {
    field: undefined,
    error: {
      code: 'email.invalid',
      message: 'email is not valid'
    },
    type: 'email'
  }, config || {} ),

  emaiRgx = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;

  return utils.extend( validate, {
    type: 'email',
    field: params.field
  } );

  function validate( value ) {

    var clean = typeof value === 'string' ? value.trim() : '';

    if ( clean.indexOf( ' ' ) !== -1 || !emaiRgx.test( clean ) ) {

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