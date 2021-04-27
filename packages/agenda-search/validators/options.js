'use strict';

const schemas = require('@openagenda/validators/schema');
const { paths } = require('../service/lib/fields');

schemas.register({
  boolean: require('@openagenda/validators/boolean'),
  text: require('@openagenda/validators/text'),
  choice: require('@openagenda/validators/choice')
});

module.exports = schemas({
  detailed: {
    type: 'boolean',
    default: false
  },
  includeFields: {
    type: 'choice',
    options: paths
  },
  indexed: {
    type: 'boolean',
    allowNull: true,
    default: true
  },
  access: {
    type: 'text',
    default: 'public'
  }
});