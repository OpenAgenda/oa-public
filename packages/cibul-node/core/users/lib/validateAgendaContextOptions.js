'use strict';

const schema = require('@openagenda/validators/schema');
const choiceValidator = require('@openagenda/validators/choice');

schema.register({
  choice: choiceValidator
});

module.exports = schema({
  includes: {
    type: 'choice',
    options: ['me.authorizations', 'me.member', 'me.events', 'events'],
    default: ['me.authorizations', 'me.member']
  }
});
