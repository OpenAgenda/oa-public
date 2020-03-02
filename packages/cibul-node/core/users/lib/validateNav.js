'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  integer: require('@openagenda/validators/integer'),
  text: require('@openagenda/validators/text')
});

const ValidationError = require('../../utils/ValidationError');

const validate = schema({
  after: {
    type: 'integer'
  },
  limit: {
    type: 'integer',
    max: 1000,
    default: 20
  }
});


module.exports = data => {
  try {
    return validate(data);
  } catch (e) {
    throw new ValidationError(e);
  }
}

