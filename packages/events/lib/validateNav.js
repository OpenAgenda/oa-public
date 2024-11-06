import schema from '@openagenda/validators/schema/index.js';
import text from '@openagenda/validators/text.js';
import integer from '@openagenda/validators/integer.js';
import boolean from '@openagenda/validators/boolean.js';

schema.register({
  integer,
  text,
  boolean,
});

export default schema({
  after: {
    type: 'integer',
    default: null,
  },
  offset: {
    type: 'integer',
    default: null,
  },
  limit: {
    type: 'integer',
    default: 20,
  },
  order: {
    type: 'choice',
    default: 'id.asc',
    unique: true,
    options: ['id.asc', 'id.desc', 'updatedAt.asc', 'updatedAt.desc'],
  },
});
