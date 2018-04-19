"use strict";

var schema = require('@openagenda/validators/schema');

schema.register({
  boolean: require('@openagenda/validators/boolean')
});

module.exports = schema({
  detailed: {
    type: 'boolean',
    default: false
  }
});
//# sourceMappingURL=getOptions.js.map