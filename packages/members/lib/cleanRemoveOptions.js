'use strict';

const schema = require('@openagenda/validators/schema');
const pass = require('@openagenda/validators/pass');

schema.register({
  pass
});

module.exports = schema({
  context: {
    user: {
      // user triggering the remove
      type: 'pass',
      default: null
    }
  }
});
