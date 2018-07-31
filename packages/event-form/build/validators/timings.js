"use strict";

var list = require('@openagenda/validators/list');
var schema = require('@openagenda/validators/schema');

schema.register({
  date: require('@openagenda/validators/date')
});

var validateTiming = schema({
  begin: {
    type: 'date',
    optional: false
  },
  end: {
    type: 'date',
    optional: false
  }
});

module.exports = function () {
  return list({
    field: 'timings',
    min: 1,
    types: ['timing'],
    validators: { timing: validateTiming }
  });
};
//# sourceMappingURL=timings.js.map