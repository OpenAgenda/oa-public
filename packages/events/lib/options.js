'use strict';

const schema = require('@openagenda/validators/schema');
const boolean = require('@openagenda/validators/boolean');
const integer = require('@openagenda/validators/integer');
const choice = require('@openagenda/validators/choice');
const text = require('@openagenda/validators/text');

schema.register({
  boolean,
  integer,
  choice,
  text
});

const fields = require('./fields');

const base = {
  includeFields: {
    type: 'choice',
    options: fields.map(f => f.field),
  },
  private: {
    type: 'boolean',
    default: false,
    allowNull: true
  },
  access: {
    type: 'text',
    default: 'public'
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
  },
  lang: {
    type: 'text',
    optional: true,
    max: 2,
    min: 2
  },
  useFallbackLang: {
    type: 'boolean',
    default: false
  },
  useDefaultImage: {
    type: 'boolean',
    default: false
  },
  imageAsLink: {
    type: 'boolean',
    default: false
  }
};

module.exports = (extendWith = {}) => schema({
  ...base,
  ...extendWith
});
