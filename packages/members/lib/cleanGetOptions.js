import schema from '@openagenda/validators/schema/index.js';
import boolean from '@openagenda/validators/boolean.js';

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
