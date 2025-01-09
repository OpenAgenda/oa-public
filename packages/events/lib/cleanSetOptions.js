import schema from '@openagenda/validators/schema/index.js';
import integer from '@openagenda/validators/integer.js';
import boolean from '@openagenda/validators/boolean.js';
import pass from '@openagenda/validators/pass.js';

import fields from './fields.js';

schema.register({
  integer,
  boolean,
  pass,
});

export default schema({
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
  transferToLegacy: {
    type: 'boolean',
    default: true,
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
});
