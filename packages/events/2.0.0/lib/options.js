'use strict';

const schema = require('@openagenda/validators/schema');
const boolean = require('@openagenda/validators/boolean');
const integer = require('@openagenda/validators/integer');
const choice = require('@openagenda/validators/choice');

schema.register({
  boolean,
  integer,
  choice
});

const fields = require('./fields');

const base = {
  includeImagePath: {
    type: 'boolean',
    default: false
  },
  includeFields: {
    type: 'choice',
    options: fields.map(f => f.field),
  },
  private: {
    type: 'boolean',
    default: false,
    allowNull: true
  },
  draft: {
    type: 'boolean',
    default: false,
    allowNull: true
  },
  deleted: {
    type: 'boolean',
    default: false,
    allowNull: true
  },
  detailed: {
    type: 'boolean',
    default: false
  },
  html: {
    type: 'boolean',
    default: false
  }
}

module.exports = (extendWith = {}) => schema({
  ...base,
  ...extendWith
});