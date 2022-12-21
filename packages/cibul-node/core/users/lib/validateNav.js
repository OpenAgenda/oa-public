'use strict';

const schema = require('@openagenda/validators/schema');
const { BadRequest } = require('@openagenda/verror');

const integerValidator = require('@openagenda/validators/integer');
const textValidator = require('@openagenda/validators/text');

schema.register({
  integer: integerValidator,
  text: textValidator,
});

const validate = schema({
  after: {
    type: 'integer',
  },
  limit: {
    type: 'integer',
    max: 1000,
    default: 20,
  },
});

module.exports = data => {
  try {
    return validate(data);
  } catch (errors) {
    throw new BadRequest({ info: { errors } }, 'invalid navigation parameters');
  }
};
