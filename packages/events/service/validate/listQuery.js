"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  boolean: require( '@openagenda/validators/boolean' ),
  text: require( '@openagenda/validators/text' ),
  integer: require( '@openagenda/validators/integer' ),
  choice: require( '@openagenda/validators/choice' ),
  date: require( '@openagenda/validators/date' )
} );

module.exports = schema( {
  search: {
    type: 'text',
    max: 255,
    default: null
  },
  order: {
    type: 'choice',
    default: null,
    options: [ 'updatedAt.desc', 'createdAt.desc', 'updatedAt.asc', 'updatedAt.desc' ],
    unique: true
  },
  private: {
    type: 'choice',
    default: undefined,
    options: [ true, false, null ],
    unique: true
  },
  draft: {
    type: 'choice',
    default: false,
    options: [ true, false, null ],
    unique: true
  },
  uid: {
    type: 'integer',
    list: { default: null }
  },
  locationUid: {
    type: 'integer',
    default: null
  },
  ownerUid: {
    type: 'integer',
    default: null
  },
  createdAt: {
    type: 'date',
    default: null
  },
  updatedAt: {
    type: 'date',
    default: null
  }
} );
