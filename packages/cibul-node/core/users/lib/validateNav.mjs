import schema from '@openagenda/validators/schema/index.js';
import { BadRequest } from '@openagenda/verror';
import integerValidator from '@openagenda/validators/integer.js';
import textValidator from '@openagenda/validators/text.js';

schema.register({
  integer: integerValidator,
  text: textValidator,
});

const validate = schema({
  after: {
    type: 'integer',
  },
  limit: {
    type: 'integer',
    max: 1000,
    default: 20,
  },
});

export default data => {
  try {
    return validate(data);
  } catch (errors) {
    throw new BadRequest({ info: { errors } }, 'invalid navigation parameters');
  }
};
