"use strict";

const _ = {
  get: require( 'lodash/get' )
};

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  text: require( '@openagenda/validators/text' )
} );

const validate = schema( {
  extension: {
    type: 'text'
  },
  originalName: {
    type: 'text'
  },
  filename: {
    type: 'text'
  }
} );

module.exports = validatorOptions => v => {

  const optional = _.get( validatorOptions, 'optional', true );

  if ( !optional && !v ) {

    throw [ {
      code: 'required',
      message: 'A value is required',
      field: _.get( validatorOptions, 'field', null )
    } ];

  }

  return validate( v );

}
