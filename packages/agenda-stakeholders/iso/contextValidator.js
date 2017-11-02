"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  text: require( '@openagenda/validators/text' ),
  number: require( '@openagenda/validators/number' ),
  choice: require( '@openagenda/validators/choice' ),
  email: require( '@openagenda/validators/email' )
} );

/**
 * stakeholder validator. Needs the fields settings to work
 */

module.exports = schema( {
  lang: {
    optional: true,
    type: 'choice',
    options: [ 'en', 'fr' ],
    unique: true,
    default: 'en'
  },
  message: {
    optional: true,
    type: 'text',
    max: 2000
  },
  replyTo: {
    optional: true,
    type: 'email'
  },
  invitationSender: {
    userId: {
      optional: true,
      type: 'number'
    },
    name: {
      optional: true,
      type: 'text'
    }
  }
} );