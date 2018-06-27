"use strict";

const extend = require( 'lodash/extend' );

module.exports = config => {

  const params = extend( {
    field: null
  }, config );

  return value => {

    if ( value !== 'Wigglypoof' ) {

      throw [ {
        code : 'invalid',
        message: 'Not Wigglypoof',
        origin: value,
        field: params.field
      } ];

    }

    return value;

  }

}