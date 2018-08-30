"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  integer: require( '@openagenda/validators/integer' ),
  boolean: require( '@openagenda/validators/boolean' )
} );

const validate = schema( {
  transferToLegacy: {
    type: 'boolean',
    default: false
  },
  context: {
    userUid: {
      type: 'integer',
      optional: true,
      default: null
    },
    agendaUid: {
      type: 'integer',
      optional: true,
      default: null
    },
    transferToLegacy: {
      type: 'boolean',
      default: false
    },
    deletion: {
      type: 'boolean',
      optional: true,
      default: null
    }
  }
} );

module.exports = values => {

  const clean = validate( values );

  clean.context.transferToLegacy = clean.transferToLegacy;

  return clean;

}
