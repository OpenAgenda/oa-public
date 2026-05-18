import schema from '@openagenda/validators/schema';
import integer from '@openagenda/validators/integer';
import boolean from '@openagenda/validators/boolean';

schema.register({
  integer,
  boolean,
});

export default schema({
  endpointId: {
    agendaUid: {
      type: 'integer',
      default: null,
    },
    setUid: {
      type: 'integer',
      default: null,
    },
  },
  includeImagePath: {
    type: 'boolean',
    default: false,
  },
  autocomplete: {
    type: 'boolean',
    default: false,
  },
  mergeExtIds: {
    type: 'boolean',
    default: true,
  },
  fromMerge: {
    type: 'boolean',
    default: false,
  },
});
