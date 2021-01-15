'use strict';

const schema = require('@openagenda/validators/schema');
const text = require('@openagenda/validators/text');
const integer = require('@openagenda/validators/integer');
const boolean = require('@openagenda/validators/boolean');

schema.register({
  integer,
  text,
  boolean
});

module.exports = schema({
  after: {
    type: 'integer',
    default: null
  },
  offset: {
    type: 'integer',
    default: null
  },
  limit: {
    type: 'integer',
    default: 20
  },
  order: {
    type: 'choice',
    default: 'id.asc',
    unique: true,
    options: [
      'id.asc',
      'id.desc',
      'updatedAt.asc',
      'updatedAt.desc'
    ]
  }
});
