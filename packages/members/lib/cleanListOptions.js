import schema from '@openagenda/validators/schema/index';
import boolean from '@openagenda/validators/boolean';
import pass from '@openagenda/validators/pass';

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
