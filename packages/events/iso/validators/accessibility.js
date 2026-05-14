import boolean from '@openagenda/validators/boolean';
import schema from '@openagenda/validators/schema/index';

schema.register({ boolean });

export default () =>
  schema({
    hi: { type: 'boolean', defaultValue: false },
    ii: { type: 'boolean', defaultValue: false },
    vi: { type: 'boolean', defaultValue: false },
    mi: { type: 'boolean', defaultValue: false },
    pi: { type: 'boolean', defaultValue: false },
  });
