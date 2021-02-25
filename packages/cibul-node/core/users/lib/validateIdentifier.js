'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  integer: require('@openagenda/validators/integer'),
  text: require('@openagenda/validators/text')
});

const validate = schema({
  uid: {
    type: 'integer',
    optional: true
  },
  secretKey: {
    type: 'text',
    optional: true
  }
});

module.exports = (dirty, options = {}) => {
  const clean = validate(dirty instanceof Object ? dirty: { uid: dirty });

  if (options.pickOne) {
    const field = Object.keys(clean).filter(key => !!clean[key])[0];
    return {
      [field]: clean[field]
    }
  }

  return clean;
}
