"use strict";

var schema = require('@openagenda/validators/schema');

schema.register({
  text: require('@openagenda/validators/text')
});

module.exports = schema({
  iframely: {
    key: {
      type: 'text',
      optional: false
    },
    res: {
      type: 'text',
      default: 'https://iframe.ly/api/oembed'
    }
  },
  filters: {
    type: 'text',
    list: true,
    default: []
  }
});
//# sourceMappingURL=options.js.map