import schema from '@openagenda/validators/schema/index.js';
import textValidator from '@openagenda/validators/text.js';
import booleanValidator from '@openagenda/validators/boolean.js';
import passValidator from '@openagenda/validators/pass.js';
import choiceValidator from '@openagenda/validators/choice.js';

schema.register({
  text: textValidator,
  boolean: booleanValidator,
  pass: passValidator,
  choice: choiceValidator,
});

const validate = schema({
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
  first: {
    // return first result only
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
  useAdminLevels: {
    type: 'boolean',
    optional: true,
    allowNull: true,
    default: null,
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
  removed: {
    type: 'boolean',
    optional: true,
    default: false,
    allowNull: true,
  },
  includeSort: {
    type: 'boolean',
    optional: true,
    default: false,
  },
});

export default function validateSearchOptions(options = {}) {
  return validate({
    ...options,
    includeFields: options.includeFields || options.if,
  });
}
