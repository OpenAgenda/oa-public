'use strict';

const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');
const pass = require('@openagenda/validators/pass');
const boolean = require('@openagenda/validators/boolean');
const cleanRule = require('../utils/rules/clean');

schema.register({
  integer,
  pass,
  boolean,
});

const ruleFields = {
  query: {
    optional: true,
    type: 'pass',
  },
  actions: {
    optional: true,
    type: 'pass',
  },
  required: {
    optional: true,
    type: 'boolean',
    default: false,
  },
};

const validate = schema({
  limit: {
    type: 'integer',
    optional: true,
    default: null,
  },
  rules: {
    list: true,
    fields: ruleFields,
  },
});

const validateRule = schema(ruleFields);

module.exports = (data, options = {}) => {
  const { patch, protected: isProtected } = {
    patch: false,
    protected: true,
    ...options,
  };

  let rules;

  if (data instanceof Object && data.rules) {
    rules = cleanRule(data.rules);
  } else if (!patch) {
    rules = [];
  }

  const result = (patch ? validate.part : validate)({
    ...data,
    ...rules ? { rules } : {},
  });

  if (isProtected) {
    delete result.limit;
  }

  return result;
};

module.exports.rule = r => validateRule(cleanRule(r));
