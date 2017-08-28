"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  integer: require( 'validators/integer' )
} );

module.exports = schema( {
  private: {
    type: 'boolean',
    default: false,
    allowNull: true
  },
  deleted: {
    type: 'boolean',
    default: false,
    allowNull: true
  },
  internal: {
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