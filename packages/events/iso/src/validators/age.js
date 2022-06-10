"use strict";

const schema = require('@openagenda/validators/schema');

schema.register({
  integer: require('@openagenda/validators/integer')
});

const validate = schema({
  min: {
    type: 'integer',
    min: 0,
    default: null
  },
  max: {
    type: 'integer',
    min: 0,
    max: 122,
    default: null
  }
});

module.exports = () => validate;
