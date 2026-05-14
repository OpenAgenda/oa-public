import schema from '@openagenda/validators/schema/index';
import integer from '@openagenda/validators/integer';
import pass from '@openagenda/validators/pass';
import boolean from '@openagenda/validators/boolean';
import cleanRule from '../utils/rules/clean.js';

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

export default (data, options = {}) => {
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

export function rule(r) {
  return validateRule(cleanRule(r));
}
