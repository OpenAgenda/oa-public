"use strict";

var schema = require('@openagenda/validators/schema');

schema.register({
  integer: require('@openagenda/validators/integer')
});

var validate = schema({
  min: {
    type: 'integer',
    min: 0
  },
  max: {
    type: 'integer',
    min: 0,
    max: 122
  }
});

module.exports = function () {
  return validate;
};
//# sourceMappingURL=age.js.map