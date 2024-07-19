import schema from '@openagenda/validators/schema/index.js';
import booleanValidator from '@openagenda/validators/boolean.js';

schema.register({
  boolean: booleanValidator,
});

export default schema({
  detailed: {
    type: 'boolean',
    default: false,
  },
});
