"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  boolean: require( '@openagenda/validators/boolean' ),
  text: require( '@openagenda/validators/text' ),
  pass: require( '@openagenda/validators/pass' )
} );

module.exports = schema( {
  requireCustom: {
    type: 'boolean',
    default: true
  },
  context: {
    lang: {
      type: 'text',
      default: null,
      max: 2
    },
    invitationSender: {
      type: 'pass',
      default: null
    }
  }
} );
