'use strict';

var boolean = require('@openagenda/validators/boolean');

var schema = require('@openagenda/validators/schema');

schema.register({
  boolean: boolean
});

module.exports = function () {
  return schema({
    hi: {
      type: 'boolean',
      defaultValue: false
    },
    ii: {
      type: 'boolean',
      defaultValue: false
    },
    vi: {
      type: 'boolean',
      defaultValue: false
    },
    mi: {
      type: 'boolean',
      defaultValue: false
    },
    pi: {
      type: 'boolean',
      defaultValue: false
    }
  });
};
//# sourceMappingURL=accessibility.js.map