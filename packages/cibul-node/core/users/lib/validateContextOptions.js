'use strict';

const schema = require('@openagenda/validators/schema');
const choiceValidator = require('@openagenda/validators/choice');

schema.register({
  choice: choiceValidator
});

const validateContextOptions = schema({
  includes: {
    type: 'choice',
    options: ['me.authorizations', 'me.member', 'member'],
    default: ['me.authorizations', 'me.member', 'member']
  }
});

module.exports = validateContextOptions;
