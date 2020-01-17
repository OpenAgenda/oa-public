'use strict';

const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');
const pass = require('@openagenda/validators/pass');
const boolean = require('@openagenda/validators/boolean');

const cleanRule = require('../utils/rules/clean');

schema.register({
  integer,
  pass,
  boolean
});

const ruleFields = {
  query: {
    optional: true,
    type: 'pass'
  },
  actions: {
    optional: true,
    type: 'pass'
  },
  required: {
    optional: true,
    type: 'boolean',
    default: true
  }
}

const validate = schema({
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

const validateRule = schema(ruleFields);

module.exports = data => {
  const rules = data instanceof Object && data.rules ? cleanRule(data.rules) : [];

  return validate({
    ...data,
    rules
  });
}

module.exports.rule = r => validateRule(cleanRule(r));
