'use strict';

const schema = require('@openagenda/validators/schema');
const text = require('@openagenda/validators/text');

schema.register({
  text,
});

module.exports = schema({
  iframely: {
    key: {
      type: 'text',
      optional: false,
    },
    res: {
      type: 'text',
      default: 'https://iframe.ly/api/oembed',
    },
  },
  filters: {
    type: 'text',
    list: true,
    default: [],
  },
});
