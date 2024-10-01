'use strict';

const schema = require('@openagenda/validators/schema');
const text = require('@openagenda/validators/text');
const bool = require('@openagenda/validators/boolean');

schema.register({
  text,
  bool,
});

module.exports = schema({
  includeEmbedScripts: {
    type: 'bool',
    default: true,
  },
  cspNonce: {
    type: 'text',
  },
});
