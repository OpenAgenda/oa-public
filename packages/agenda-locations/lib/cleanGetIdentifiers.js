import schema from '@openagenda/validators/schema';
import integer from '@openagenda/validators/integer';
import text from '@openagenda/validators/text';
import pass from '@openagenda/validators/pass';

import { BadRequest } from '@openagenda/verror';

schema.register({ integer, text, pass });

const validate = schema({
  slug: {
    type: 'text',
  },
  uid: {
    type: 'integer',
  },
  extId: {
    type: 'pass',
  },
});

const validateExtIds = schema({
  key: { type: 'text', optional: false },
  value: { type: 'text', optional: false },
});

export default (identifiers) => {
  try {
    const clean = validate(
      ['number', 'string'].includes(typeof identifiers)
        ? {
          uid: identifiers,
        }
        : identifiers,
    );

    if (!clean.uid && !clean.extId && !clean.slug) {
      throw new Error('identifier is missing');
    }
    if (clean.extId) {
      clean.extIds = validateExtIds(clean.extId);
      return clean;
    }
    const getFieldName = Object.keys(clean)
      .filter((f) => !!clean[f])
      .pop();

    return {
      [getFieldName]: clean[getFieldName],
    };
  } catch (e) {
    throw new BadRequest('Invalid identifiers');
  }
};
