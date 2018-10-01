"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  boolean: require( '@openagenda/validators/boolean' ),
  text: require( '@openagenda/validators/text' )
} );

module.exports = schema( {
  private: {
    type: 'boolean',
    default: false,
    allowNull: true
  },
  indexed: {
    type: 'boolean',
    default: null
  },
  total: {
    type: 'boolean',
    default: false
  },
  detailed: {
    type: 'boolean',
    default: false
  },
  internal: {
    type: 'boolean',
    default: null
  },
  includeImagePath: {
    type: 'boolean',
    default: false
  },
  useDefaultImage: {
    type: 'boolean',
    default: false
  },
  includeFields: {
    type: 'text',
    list: true
  }
} );
