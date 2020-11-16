'use strict';

const BadRequestError = require('./BadRequestError');

const schema = require('@openagenda/validators/schema');

schema.register({
  integer: require('@openagenda/validators/integer'),
  text: require('@openagenda/validators/text')
});

const validate = schema({
  uid: {
    type: 'integer'
  },
  extId: {
    type: 'text'
  }
});

module.exports = identifiers => {
  try {
    const clean = validate(
      ['number', 'string'].includes(typeof identifiers) ? {
        uid: identifiers
      } : identifiers
    );
    const getFieldName = Object.keys(clean).filter(f => !!clean[f]).pop();

    return {
      [getFieldName]: clean[getFieldName]
    };
  } catch (e) {
    throw new BadRequestError('Invalid identifiers');
  }
}
