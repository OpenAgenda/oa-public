'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  text: require('@openagenda/validators/text'),
  link: require('@openagenda/validators/link'),
  pass: require('@openagenda/validators/pass'),
  bool: require('@openagenda/validators/boolean')
});

module.exports = schema({
  current: {
    list: true,
    fields: {
      link: {
        type: 'link',
        optional: false
      },
      data: {
        type: 'pass',
        optional: false
      }
    }
  },
  includeEmbedlessLinks: {
    type: 'bool',
    default: false
  }
});
