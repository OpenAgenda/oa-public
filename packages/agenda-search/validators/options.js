'use strict';

const schemas = require('@openagenda/validators/schema');
const boolean = require('@openagenda/validators/boolean');
const text = require('@openagenda/validators/text');
const choice = require('@openagenda/validators/choice');
const { paths } = require('../service/lib/fields');

schemas.register({
  boolean,
  text,
  choice,
});

module.exports = schemas({
  detailed: {
    type: 'boolean',
    default: false,
  },
  includeFields: {
    type: 'choice',
    options: paths,
  },
  useDefaultImage: {
    type: 'boolean',
    default: false,
  },
  includeImagePath: {
    type: 'boolean',
    default: true,
  },
  indexed: {
    type: 'boolean',
    allowNull: true,
    default: true,
  },
  access: {
    type: 'text',
    default: 'public',
  },
});
