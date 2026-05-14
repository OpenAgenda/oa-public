import schema from '@openagenda/validators/schema/index';
import boolean from '@openagenda/validators/boolean';
import text from '@openagenda/validators/text';

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
  deleted: {
    type: 'boolean',
    default: false,
    allowNull: true,
  },
  internal: {
    type: 'boolean',
    default: false,
  },
  includeImagePath: {
    type: 'boolean',
    default: false,
  },
  useDefaultImage: {
    type: 'boolean',
    default: false,
  },
  instanciate: {
    type: 'boolean',
    default: false,
  },
});
