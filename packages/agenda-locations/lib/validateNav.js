'use strict';

const schema = require('@openagenda/validators/schema');
const text = require('@openagenda/validators/text');
const integer = require('@openagenda/validators/integer');
const boolean = require('@openagenda/validators/boolean');

const validateCreatedAtAfter = integer({ default: null });
const validateNameAfter = v => {
  if (!Array.isArray(v)) {
    throw new Error('after should be array');
  }
  if (v.length !== 2) {
    throw new Error('after should be array of length 2');
  }

  return v;
};

schema.register({
  integer,
  text,
  boolean,
});

const validate = schema({
  offset: {
    type: 'integer',
    default: null,
  },
  limit: {
    type: 'integer',
    default: 20,
    max: 300
  },
  order: {
    type: 'choice',
    default: 'createdAt.desc',
    unique: true,
    options: [
      'createdAt.asc',
      'createdAt.desc',
      'name.asc',
      'name.desc'
    ]
  },
  useAfter: {
    type: 'boolean',
    default: false,
  },
});

module.exports = nav => {
  const clean = validate(nav);

  const orderField = clean.order.split('.')[0];

  if (orderField === 'createdAt' && (nav.after !== undefined)) {
    clean.after = validateCreatedAtAfter(nav.after);
    clean.useAfter = true;
  } else if (orderField === 'name' && (nav.after !== undefined)) {
    clean.after = validateNameAfter(nav.after);
    clean.useAfter = true;
  }

  return clean;
};
