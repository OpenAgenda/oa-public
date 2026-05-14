import schema from '@openagenda/validators/schema';
import boolean from '@openagenda/validators/boolean';
import number from '@openagenda/validators/number';

schema.register({
  boolean,
  number,
});

export default schema({
  saveCandidates: {
    type: 'boolean',
    default: false,
  },
  geoRange: {
    type: 'number',
    default: 0.01,
  },
});
