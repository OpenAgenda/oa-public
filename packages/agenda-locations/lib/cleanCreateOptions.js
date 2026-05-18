import schema from '@openagenda/validators/schema';
import integer from '@openagenda/validators/integer';

schema.register({
  integer,
});

export default schema({
  context: {
    agendaUid: {
      type: 'integer',
      default: null,
    },
  },
});
