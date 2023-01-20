'use strict';

const schema = require('@openagenda/validators/schema');
const choiceValidator = require('@openagenda/validators/choice');
const integerValidator = require('@openagenda/validators/integer');

schema.register({
  choice: choiceValidator,
  integer: integerValidator,
});

module.exports = schema({
  userUid: {
    type: 'integer',
    default: null,
  },
  includes: {
    type: 'choice',
    options: ['me.authorizations', 'me.member', 'me.events', 'events', 'agenda'],
    default: ['me.authorizations', 'me.member'],
  },
});
