'use strict';

const schema = require('@openagenda/validators/schema');
const date = require('@openagenda/validators/date');
const compareBeginAndEnd = require('../compareBeginAndEnd');
schema.register({
  date
});
const validate = schema({
  begin: {
    type: 'date',
    optional: false
  },
  end: {
    type: 'date',
    optional: false
  }
});
module.exports = value => {
  const {
    begin,
    end
  } = validate(value);
  compareBeginAndEnd(begin, end, value);
  return {
    begin,
    end
  };
};
//# sourceMappingURL=timing.js.map