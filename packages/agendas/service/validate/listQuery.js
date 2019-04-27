"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  integer: require( '@openagenda/validators/integer' ),
  date: require( '@openagenda/validators/date' ),
  choice: require( '@openagenda/validators/choice' )
} );

module.exports = schema( {
  ids: { // DEPRECATED
    type: 'integer',
    list: { default: null }
  },
  detailed: { // deprecated
    type: 'boolean',
    default: false
  },
  private: { // deprecated
    type: 'boolean',
    nullable: true,
    default: false
  },
  search: {
    type: 'text'
  },
  id: {
    type: 'integer',
    list: { default: null }
  },
  uid: {
    type: 'integer',
    list: { default: null }
  },
  networkUid: {
    type: 'integer'
  },
  updatedAtGreaterThan: {
    type: 'date',
    default: null
  },
  idGreaterThan: {
    type: 'integer',
    default: null
  },
  order: {
    type: 'choice',
    options: [ 'updatedAt.desc', 'createdAt.desc', 'updatedAt.asc', 'updatedAt.desc' ],
    default: null,
    unique: true
  }
} );
