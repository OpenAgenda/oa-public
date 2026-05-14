import schema from '@openagenda/validators/schema/index';
import integer from '@openagenda/validators/integer';
import boolean from '@openagenda/validators/boolean';
import pass from '@openagenda/validators/pass';

import fields from './fields.js';

schema.register({
  integer,
  boolean,
  pass,
});

const validator = schema({
  access: {
    type: 'text',
    default: 'public',
  },
  context: {
    type: 'pass',
    default: {},
  },
  draft: {
    type: 'boolean',
    default: false,
  },
  detailed: {
    type: 'boolean',
    default: false,
  },
  includeFields: {
    type: 'choice',
    options: fields.map((f) => f.field),
  },
  useProvidedIdentifiers: {
    type: 'boolean',
    default: false,
  },
  private: {
    type: 'boolean',
    default: false,
    allowNull: true,
  },
  protected: {
    type: 'boolean',
    default: true,
  },
  mergeExtIds: {
    type: 'boolean',
    default: true,
  },
  fileKey: {
    type: 'text',
  },
  formSchema: {
    type: 'pass',
    optional: true,
  },
});

export default validator;
