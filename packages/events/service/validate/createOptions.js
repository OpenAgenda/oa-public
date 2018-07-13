"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  integer: require( '@openagenda/validators/integer' ),
  boolean: require( '@openagenda/validators/boolean' )
} );

const validate = schema( {
  internal: {
    type: 'boolean',
    default: false
  },
  protected: {
    type: 'boolean',
    default: true
  },
  includeImagePath: {
    type: 'boolean',
    default: false
  },
  transferToLegacy: {
    type: 'boolean',
    default: false
  },
  evaluateLegacyIdentifiers: {
    type: 'boolean',
    default: true
  },
  draft: {
    type: 'boolean',
    default: false
  },
  context: {
    includeImagePath: {
      type: 'boolean',
      default: false
    },
    userUid: {
      type: 'integer',
      optional: true,
      default: null
    },
    agendaUid: {
      type: 'integer',
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