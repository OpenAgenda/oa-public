import schema from '@openagenda/validators/schema/index.js';
import boolean from '@openagenda/validators/boolean.js';
import pass from '@openagenda/validators/pass.js';

schema.register({
  boolean,
  pass,
});

export default schema({
  detailed: {
    type: 'boolean',
    default: false,
  },
  total: {
    type: 'boolean',
    default: false,
  },
  legacy: {
    type: 'boolean',
    default: false,
  },
  userOptions: {
    type: 'pass',
  },
  customDataAtRoot: {
    type: 'boolean',
    default: false,
  },
});
