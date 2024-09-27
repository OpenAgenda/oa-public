'use strict';

const schema = require('@openagenda/validators/schema');
const integerValidator = require('@openagenda/validators/integer');
const textValidator = require('@openagenda/validators/text');

const BadRequestError = require('./BadRequestError');

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

module.exports = (identifiers) => {
  try {
    const clean = validate(
      ['number', 'string'].includes(typeof identifiers)
        ? {
          uid: identifiers,
        }
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
    throw new BadRequestError(e, 'Invalid identifiers');
  }
};
