"use strict";

const schemas = require( 'validators/schema' );

schemas.register( {
  text: require( 'validators/text' ),
  regex: require( 'validators/regex' ),
  boolean: require( 'validators/boolean' )
} );

module.exports = schemas( {
  search: {
    type: 'text',
    optional: true,
    default: null
  },
  official: {
    type: 'boolean',
    optional: true,
    default: null
  },
  sort: {
    type: 'regex',
    optional: true,
    error: {
      code: 'sort.invalid',
      message: 'sort value is not valid'
    },
    regex: /createdAt\.desc/,
    default: null
  }
} );