'use strict';

const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');

schema.register({
  integer
});

const ruleFields = {
  query: {
    optional: true,
    type: 'pass'
  },
  transform: {
    optional: true,
    type: 'pass'
  },
  required: {
    optional: true,
    type: 'boolean',
    default: true
  }
}

module.exports = schema({
  version: {
    type: 'integer',
    optional: true,
    default: 2
  },
  rules: {
    list: true,
    fields: ruleFields
  }
});

module.exports.rule = schema(ruleFields);
