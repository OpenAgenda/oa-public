"use strict";

const log = require( '@openagenda/logs' )( 'createOptions' );

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
  detailed: {
    type: 'boolean',
    default: false
  },
  // if creation of event comes from legacy, this should be true
  legacy: {
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

  try {

    const clean = validate( values );

    clean.context.transferToLegacy = clean.transferToLegacy;

    return clean;

  } catch ( e ) {

    log( 'error', 'create optionas are invalid', values, e );

    throw e;

  }

}
