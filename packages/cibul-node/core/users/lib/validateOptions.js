import schema from '@openagenda/validators/schema/index';
import booleanValidator from '@openagenda/validators/boolean';

schema.register({
  boolean: booleanValidator,
});

export default schema({
  detailed: {
    type: 'boolean',
    default: false,
  },
});
