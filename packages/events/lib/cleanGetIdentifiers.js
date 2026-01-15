import schema from '@openagenda/validators/schema/index.js';
import integerValidator from '@openagenda/validators/integer.js';
import textValidator from '@openagenda/validators/text.js';
import { BadRequest } from '@openagenda/verror';

schema.register({
  integer: integerValidator,
  text: textValidator,
});

const validate = schema({
  uid: {
    type: 'integer',
  },
  slug: {
    type: 'text',
  },
});

export default (identifiers) => {
  try {
    const clean = validate(
      ['number', 'string'].includes(typeof identifiers)
        ? { uid: identifiers }
        : identifiers,
    );

    const getFieldName = Object.keys(clean)
      .filter((f) => ![null, undefined].includes(clean[f]))
      .pop();

    if (!getFieldName) {
      throw new Error('could not extract field name');
    }

    return {
      [getFieldName]: clean[getFieldName],
    };
  } catch (e) {
    throw new BadRequest({ info: { errors: e } }, 'Invalid identifiers');
  }
};
