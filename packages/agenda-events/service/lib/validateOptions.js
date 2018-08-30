"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  boolean: require( '@openagenda/validators/boolean' )
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
      // user at the origin of the operation
      userUid: {
        type: 'integer',
        default: null
      },
      // agenda at the origin of the operation
      agendaUid: {
        type: 'integer',
        default: null
      },
      // if operation was done through legacy app
      legacy: {
        type: 'boolean',
        default: true
      },
      deletion: {
        type: 'boolean',
        optional: true,
        default: null
      }
    }
  }
} );
