import schema from '@openagenda/validators/schema/index';
import integer from '@openagenda/validators/integer';

schema.register({
  integer,
});

export default schema({
  after: {
    type: 'integer',
    default: 0,
  },
  size: {
    type: 'text',
    default: 20,
    min: 0,
    max: 400,
  },
});
