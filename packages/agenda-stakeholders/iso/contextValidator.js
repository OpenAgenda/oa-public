"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  text: require( 'validators/text' ),
  choice: require( 'validators/choice' )
} );

/**
 * stakeholder validator. Needs the fields settings to work
 */

module.exports = schema( {
  lang: {
    optional: true,
    type: 'choice',
    options: [ 'en', 'fr' ],
    unique: true,
    default: 'en'
  },
  message: {
    optional: true,
    type: 'text',
    max: 2000
  }
} );