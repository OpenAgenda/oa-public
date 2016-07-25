"use strict";

import utils from 'utils'

export default config => {

  let params = utils.extend( {
    field: false,
    default: undefined,
    optional: true
  }, config );

  return utils.extend( validate, {
    type: 'boolean',
    field: params.field
  } );

  function validate( value ) {

    if ( typeof value === 'undefined' ) {

      if ( !params.optional && ( typeof params.default === 'undefined' ) ) {

        throw [ {
          field: validate.field,
          code: 'required',
          message: 'a boolean is required',
          origin: value
        } ];

      }

      if ( typeof params.default !== 'undefined' ) {

        return !!params.default;

      }

      return null;

    }

    return !!value;

  }

}