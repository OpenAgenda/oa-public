'use strict';

const schema = require('@openagenda/validators/schema');
const text = require('@openagenda/validators/text');
const link = require('@openagenda/validators/link');
const pass = require('@openagenda/validators/pass');
const bool = require('@openagenda/validators/boolean');

schema.register({
  text,
  link,
  pass,
  bool,
});

module.exports = schema({
  current: {
    list: true,
    fields: {
      link: {
        type: 'link',
        optional: false,
      },
      data: {
        type: 'pass',
        optional: false,
      },
    },
  },
  includeEmbedlessLinks: {
    type: 'bool',
    default: false,
  },
  filterInvalidLinks: {
    type: 'bool',
    default: false,
  },
  lazy: {
    type: 'bool',
    default: false,
  },
});
