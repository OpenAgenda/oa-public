"use strict";

const _ = require( 'lodash' );

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  text: require( '@openagenda/validators/text' ),
  phone: require( '@openagenda/validators/phone' ),
  email: require( '@openagenda/validators/email' )
} );

const memberSchema = require( './memberSchema' );

const validate = schema( memberSchema.fields
  .reduce( ( obj, field ) => _.set( 
    _.set( obj, field.field, field ), 
    field.field + '.type', field.fieldType 
  ), {} )
);

module.exports = data => {

  try {

    validate( data );

  } catch ( e ) {

    return false;

  }

  return true;

}
