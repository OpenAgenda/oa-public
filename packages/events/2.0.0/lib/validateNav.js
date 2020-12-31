'use strict';

const schema = require('@openagenda/validators/schema');
const text = require('@openagenda/validators/text');
const integer = require('@openagenda/validators/integer');
const boolean = require('@openagenda/validators/boolean');

schema.register({
  integer,
  text,
  boolean
});

const validate = schema({
  after: {
    type: 'integer',
    default: null
  },
  offset: {
    type: 'integer',
    default: null
  },
  limit: {
    type: 'integer',
    default: 20
  }
});

module.exports = nav => {
  const clean = validate(nav);

  if (clean.after !== null) {
    clean.useAfter = true;
  }

  return clean;
}
