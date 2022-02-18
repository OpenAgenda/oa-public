'use strict';

const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');
const text = require('@openagenda/validators/text');

schema.register({ integer, text });

const { BadRequest } = require('@openagenda/verror');

const validate = schema({
  uid: {
    type: 'integer',
  },
  extId: {
    type: 'text',
  },
});

module.exports = identifiers => {
  try {
    const clean = validate(
      ['number', 'string'].includes(typeof identifiers)
        ? {
          uid: identifiers,
        }
        : identifiers
    );
    const getFieldName = Object.keys(clean)
      .filter(f => !!clean[f])
      .pop();

    return {
      [getFieldName]: clean[getFieldName],
    };
  } catch (e) {
    throw new BadRequest('Invalid identifiers');
  }
};
