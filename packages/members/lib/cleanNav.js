'use strict';

const schema = require('@openagenda/validators/schema');
const text = require('@openagenda/validators/text');
const integer = require('@openagenda/validators/integer');
const choice = require('@openagenda/validators/choice');

schema.register({
  choice,
  integer,
  text,
});

const validate = schema({
  after: {
    type: 'text',
    list: true,
    default: null,
  },
  offset: {
    type: 'integer',
    default: null,
  },
  limit: {
    type: 'integer',
    default: 20,
  },
  page: {
    type: 'integer',
    default: null,
  },
  order: {
    type: 'choice',
    default: 'id.asc',
    unique: true,
    options: [
      'id.asc',
      'id.desc',
      'role.asc',
      'role.desc',
      'slug.asc',
      'slug.desc',
      'actionsCounter.asc',
      'actionsCounter.desc',
    ],
  },
});

module.exports = nav => {
  const clean = validate(nav);

  if (clean.order === null) {
    clean.order = 'id.asc';
  }

  return clean;
};
