"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  integer: require( '@openagenda/validators/integer' )
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
  detailed: {
    type: 'boolean',
    default: false
  },
  html: {
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
