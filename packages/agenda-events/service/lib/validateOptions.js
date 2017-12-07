"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  boolean: require( '@openagenda/validators/boolean' ),

} );

module.exports = values => {

  const clean = validate( values );

  clean.context.transferToLegacy = clean.transferToLegacy;

  return clean;

}

const validate = schema( {
  protected: {
    type: 'boolean',
    default: true
  },
  transferToLegacy: {
    type: 'boolean',
    default: false
  },
  context: {
    optional: true,
    default: null,
    fields: {
      userUid: {
        type: 'integer',
        default: null
      },
      agendaUid: {
        type: 'integer',
        default: null
      }
    }
  }
} );