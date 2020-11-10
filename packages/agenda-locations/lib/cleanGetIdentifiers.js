'use strict';

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
  if (['number', 'string'].includes(typeof identifiers)) {
    return { uid: identifiers };
  }

  const clean = validate(identifiers);
  const getFieldName = Object.keys(clean).filter(f => !!clean[f]).pop();

  return {
    [getFieldName]: clean[getFieldName]
  };
}
