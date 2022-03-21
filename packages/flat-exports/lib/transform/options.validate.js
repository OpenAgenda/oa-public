'use strict';

const schema = require('@openagenda/validators/schema');

const textValidator = require('@openagenda/validators/text');
const passValidator = require('@openagenda/validators/pass');
const numberValidator = require('@openagenda/validators/number');

schema.register({
  text: textValidator,
  pass: passValidator,
  num: numberValidator
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
    default: ' | ',
    trim: false
  },
  includeFields: {
    type: 'text',
    list: { default: null }
  },
  includeLanguages: {
    type: 'text',
    list: { default: null }
  },
  formSchema: {
    type: 'pass'
  },
  maintainedFields: {
    type: 'text',
    list: { default: [] }
  },
  agendaUid: {
    type: 'num'
  },
  distributeOptionalFields: {
    type: 'text',
    list: { default: [] }
  }
});
