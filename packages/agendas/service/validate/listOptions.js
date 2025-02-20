'use strict';

const schema = require('@openagenda/validators/schema');
const boolean = require('@openagenda/validators/boolean');
const text = require('@openagenda/validators/text');

schema.register({
  boolean,
  text,
});

module.exports = schema({
  private: {
    type: 'boolean',
    default: false,
    allowNull: true,
  },
  indexed: {
    type: 'boolean',
    default: null,
  },
  total: {
    type: 'boolean',
    default: false,
  },
  internal: {
    type: 'boolean',
    default: null,
  },
  includeImagePath: {
    type: 'boolean',
    default: false,
  },
  useDefaultImage: {
    type: 'boolean',
    default: false,
  },
  includeFields: {
    type: 'text',
    list: true,
  },
  onlyIncludeFields: {
    type: 'text',
    list: true,
  },
  offsetAsLastId: {
    type: 'boolean',
    default: false,
  },
});
