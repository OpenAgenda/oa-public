import boolean from '@openagenda/validators/boolean';
import schema from '@openagenda/validators/schema/index';

schema.register({ boolean });

export default () =>
  schema({
    hi: { type: 'boolean', default: false },
    ii: { type: 'boolean', default: false },
    vi: { type: 'boolean', default: false },
    mi: { type: 'boolean', default: false },
    pi: { type: 'boolean', default: false },
  });
