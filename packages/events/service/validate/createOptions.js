"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  integer: require( 'validators/integer' ),
  boolean: require( 'validators/boolean' )
} );

module.exports = schema( {
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
  draft: {
    type: 'boolean',
    default: false
  },
  context: {
    userUid: {
      type: 'integer',
      optional: true,
      default: null
    }
  }
} );