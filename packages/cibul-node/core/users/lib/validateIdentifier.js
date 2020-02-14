'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  integer: require('@openagenda/validators/integer'),
  text: require('@openagenda/validators/text')
});

module.exports = schema({
  uid: {
    type: 'integer',
    optional: true
  },
  secretKey: {
    type: 'text',
    optional: true
  }
});
