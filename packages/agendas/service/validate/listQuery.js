"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  integer: require( 'validators/integer' ),
  date: require( 'validators/date' ),
  choice: require( 'validators/choice' )
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
  updatedAtGreaterThan: {
    type: 'date',
    default: null
  },
  order: {
    type: 'choice',
    options: [ 'updatedAt.desc', 'createdAt.desc', 'updatedAt.asc', 'updatedAt.desc' ],
    default: null,
    unique: true
  }
} );