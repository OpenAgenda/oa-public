'use strict';

var schema = require('@openagenda/validators/schema');

var compareBeginAndEnd = require('../compareBeginAndEnd');

schema.register({
  date: require('@openagenda/validators/date')
});
var validate = schema({
  begin: {
    type: 'date',
    optional: false
  },
  end: {
    type: 'date',
    optional: false
  }
});

module.exports = function (value) {
  var _validate = validate(value),
      begin = _validate.begin,
      end = _validate.end;

  compareBeginAndEnd(begin, end, value);
  return {
    begin: begin,
    end: end
  };
};
//# sourceMappingURL=timing.js.map