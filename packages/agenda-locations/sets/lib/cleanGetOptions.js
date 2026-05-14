import schema from '@openagenda/validators/schema';
import boolean from '@openagenda/validators/boolean';

schema.register({ boolean });

export default schema({
  detailed: {
    type: 'boolean',
    default: false,
  },
  includeSettings: {
    type: 'boolean',
    default: false,
  },
});
