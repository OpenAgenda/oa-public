"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  boolean: require( 'validators/boolean' ),
  text: require( 'validators/text' ),
  integer: require( 'validators/integer' ),
  choice: require( 'validators/choice' )
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
    default: false,
    options: [ true, false, null ],
    unique: true
  },
  draft: {
    type: 'choice',
    default: false,
    options: [ true, false, null ],
    unique: true
  },
  ownerUid: {
    type: 'integer',
    default: null
  }
} );