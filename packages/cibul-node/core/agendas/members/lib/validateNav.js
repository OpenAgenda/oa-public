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
  size: {
    type: 'integer',
    max: 100,
    default: 20,
  },
});

export default (data) => {
  try {
    const preClean = {
      ...data ?? {},
    };

    if ('limit' in preClean && !('size' in preClean)) {
      preClean.size = preClean.limit;
    }

    return validate(preClean);
  } catch (errors) {
    throw new BadRequest({ info: { errors } }, 'invalid navigation parameters');
  }
};
