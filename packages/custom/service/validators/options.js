import schema from '@openagenda/validators/schema/index';
import boolean from '@openagenda/validators/boolean';
import integer from '@openagenda/validators/integer';
import pass from '@openagenda/validators/pass';

schema.register({
  boolean,
  integer,
  pass,
});

export default schema({
  draft: {
    type: 'boolean',
    optional: true,
    default: false,
  },
  validate: {
    type: 'boolean',
    optional: true,
    default: true,
  },
  partial: {
    type: 'boolean',
    optional: true,
    default: false,
  },
  preloaded: {
    // in case custom data is already in hand
    type: 'pass',
    optional: true,
  },
});
