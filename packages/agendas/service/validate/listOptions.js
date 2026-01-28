import schema from '@openagenda/validators/schema/index.js';
import boolean from '@openagenda/validators/boolean.js';
import text from '@openagenda/validators/text.js';

schema.register({
  boolean,
  text,
});

export default schema({
  private: {
    type: 'boolean',
    default: false,
    allowNull: true,
  },
  indexed: {
    type: 'boolean',
    default: null,
  },
  total: {
    type: 'boolean',
    default: false,
  },
  internal: {
    type: 'boolean',
    default: null,
  },
  includeImagePath: {
    type: 'boolean',
    default: false,
  },
  useDefaultImage: {
    type: 'boolean',
    default: false,
  },
  includeFields: {
    type: 'text',
    list: true,
  },
  onlyIncludeFields: {
    type: 'text',
    list: true,
  },
  offsetAsLastId: {
    type: 'boolean',
    default: false,
  },
});
