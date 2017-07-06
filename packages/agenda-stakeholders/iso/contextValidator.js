"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  text: require( 'validators/text' ),
  number: require( 'validators/number' ),
  choice: require( 'validators/choice' ),
  email: require( 'validators/email' )
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