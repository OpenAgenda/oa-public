'use strict';

const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');
const text = require('@openagenda/validators/text');
const pass = require('@openagenda/validators/pass');

schema.register({ integer, text, pass });

const { BadRequest } = require('@openagenda/verror');

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

module.exports = (identifiers) => {
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
