"use strict";

var schema = require('@openagenda/validators/schema');

schema.register({
  boolean: require('@openagenda/validators/boolean')
});

module.exports = schema({
  total: {
    type: 'boolean',
    default: false
  },
  detailed: {
    type: 'boolean',
    default: false
  },
  showSlugs: {
    type: 'boolean',
    default: false
  }
});
//# sourceMappingURL=listOptions.js.map