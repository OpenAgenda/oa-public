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
  detailed: {
    type: 'boolean',
    default: false
  },
  internal: {
    type: 'boolean',
    default: false
  },
  includeImagePath: {
    type: 'boolean',
    default: false
  },
  useDefaultImage: {
    type: 'boolean',
    default: false
  },
  includeRestricted: {
    type: 'boolean',
    default: false
  },
  instanciate: {
    type: 'boolean',
    default: false
  }
} );
