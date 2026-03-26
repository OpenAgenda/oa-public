import schema from '@openagenda/validators/schema/index.js';
import boolean from '@openagenda/validators/boolean.js';
import pass from '@openagenda/validators/pass.js';

schema.register({
  boolean,
  pass,
});

export default schema({
  context: {
    user: {
      // user triggering the remove
      type: 'pass',
      default: null,
    },
    silent: {
      type: 'boolean',
      default: false,
    },
  },
});
