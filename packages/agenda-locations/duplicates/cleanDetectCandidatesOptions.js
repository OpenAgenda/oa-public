'use strict';

const schema = require('@openagenda/validators/schema');
const boolean = require('@openagenda/validators/boolean');
const number = require('@openagenda/validators/number');

schema.register({
  boolean,
  number
});

module.exports = schema({
  saveCandidates: {
    type: 'boolean',
    default: false,
  },
  geoRange: {
    type: 'number',
    default: 0.01,
  }
});
