'use strict';

const schema = require('@openagenda/validators/schema');

const textValidator = require('@openagenda/validators/text');
const booleanValidator = require('@openagenda/validators/boolean');
const passValidator = require('@openagenda/validators/pass');
const choiceValidator = require('@openagenda/validators/choice');

schema.register({
  text: textValidator,
  boolean: booleanValidator,
  pass: passValidator,
  choice: choiceValidator,
});

module.exports = schema({
  aggsSizeLimit: {
    type: 'integer',
  },
  detailed: {
    type: 'boolean',
    default: false,
  },
  formSchema: {
    type: 'pass',
  },
  aggregations: {
    list: { default: null },
    type: 'pass', // aggregations are cleaned separately - see aggregation/index
  },
  first: { // return first result only
    type: 'boolean',
    default: false,
  },
  monolingual: {
    type: 'text',
    default: null,
    max: 2,
  },
  access: {
    type: 'text',
    default: 'public',
    optional: true,
  },
  includeFields: {
    type: 'text',
    optional: true,
    list: { default: null },
  },
  includeLabels: {
    type: 'boolean',
    optional: true,
    default: false,
  },
  includeImageTimestamps: {
    type: 'boolean',
    optional: true,
    default: false,
  },
  includeLocationImagePath: {
    type: 'boolean',
    optional: true,
    default: false,
  },
  useAfterKey: {
    type: 'boolean',
    optional: true,
    default: false,
  },
  useDefaultImage: {
    type: 'boolean',
    default: false,
  },
  parser: {
    type: 'pass',
  },
});
