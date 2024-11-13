import schema from '@openagenda/validators/schema/index.js';
import integer from '@openagenda/validators/integer.js';

schema.register({
  integer,
});

const validate = schema({
  min: {
    type: 'integer',
    min: 0,
    default: null,
  },
  max: {
    type: 'integer',
    min: 0,
    max: 122,
    default: null,
  },
});

export default () => validate;
