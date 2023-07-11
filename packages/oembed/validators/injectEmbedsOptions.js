'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  text: require('@openagenda/validators/text'),
  bool: require('@openagenda/validators/boolean')
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
