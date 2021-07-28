'use strict';

const schema = require('@openagenda/validators/schema');

const textValidator = require('@openagenda/validators/text');
const passValidator = require('@openagenda/validators/pass');

schema.register({
  text: textValidator,
  pass: passValidator
});

module.exports = schema({
  languages: {
    type: 'text',
    max: 2,
    min: 2,
    list: true
  },
  lang: {
    type: 'text',
    min: 2,
    max: 2,
    default: 'en'
  },
  labels: {
    type: 'pass'
  },
  separator: {
    type: 'text',
    default: ' | '
  }
});
