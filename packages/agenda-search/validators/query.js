"use strict";

const schemas = require( '@openagenda/validators/schema' );

schemas.register( {
  text: require( '@openagenda/validators/text' ),
  regex: require( '@openagenda/validators/regex' ),
  boolean: require( '@openagenda/validators/boolean' )
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