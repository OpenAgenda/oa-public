'use strict';

const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');

schema.register({
  integer,
});

const validate = schema({
  identifier: {
    type: 'integer',
    list: { default: null },
  },
});

module.exports = function listQuery(dirty) {
  const clean = validate(dirty);

  clean.identifier = clean.identifier?.filter((id) => ![undefined, null].includes(id)) ?? null;

  return clean;
};
