import schema from '@openagenda/validators/schema/index';
import boolean from '@openagenda/validators/boolean';
import pass from '@openagenda/validators/pass';

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
