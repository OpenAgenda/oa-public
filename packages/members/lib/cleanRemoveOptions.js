import schema from '@openagenda/validators/schema/index.js';
import pass from '@openagenda/validators/pass.js';

schema.register({
  pass,
});

export default schema({
  context: {
    user: {
      // user triggering the remove
      type: 'pass',
      default: null,
    },
  },
});
