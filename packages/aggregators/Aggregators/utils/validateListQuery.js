'use strict';

const schema = require('@openagenda/validators/schema');
const text = require('@openagenda/validators/text');

schema.register({
  text
});

module.exports = schema({
  search: {
    type: 'text',
    default: null
  }
});
