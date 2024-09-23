'use strict';

const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');

schema.register({
  integer,
});

const validate = schema({
  min: {
    type: 'integer',
    min: 0,
    default: null,
  },
  max: {
    type: 'integer',
    min: 0,
    max: 122,
    default: null,
  },
});

module.exports = () => validate;
