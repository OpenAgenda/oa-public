import schema from '@openagenda/validators/schema/index.js';
import date from '@openagenda/validators/date.js';

import compareBeginAndEnd from '../compareBeginAndEnd.js';

schema.register({
  date,
});

const validate = schema({
  begin: {
    type: 'date',
    optional: false,
  },
  end: {
    type: 'date',
    optional: false,
  },
});

export default (value) => {
  const { begin, end } = validate(value);

  compareBeginAndEnd(begin, end, value);

  return { begin, end };
};
