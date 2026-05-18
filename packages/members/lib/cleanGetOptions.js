import schema from '@openagenda/validators/schema/index';
import boolean from '@openagenda/validators/boolean';

schema.register({
  boolean,
});

export default schema({
  detailed: {
    type: 'boolean',
    default: false,
  },
  legacy: {
    type: 'boolean',
    default: false,
  },
  customDataAtRoot: {
    type: 'boolean',
    default: false,
  },
  throwOnNotFound: {
    type: 'boolean',
    default: false,
  },
});
