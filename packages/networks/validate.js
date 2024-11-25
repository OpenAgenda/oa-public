import schema from '@openagenda/validators/schema/index.js';
import integer from '@openagenda/validators/integer.js';
import text from '@openagenda/validators/text.js';
import date from '@openagenda/validators/date.js';

schema.register({
  integer,
  text,
  date,
});

export default schema({
  id: {
    type: 'integer',
    optional: false,
    max: 99999999,
  },
  uid: {
    type: 'integer',
    optional: false,
    max: 99999999,
  },
  title: {
    type: 'text',
    optional: false,
    min: 2,
    max: 255,
  },
  formSchemaId: {
    type: 'integer',
    optional: true,
    max: 99999999,
  },
  createdAt: {
    type: 'date',
    optional: false,
  },
  updatedAt: {
    type: 'date',
    optional: false,
  },
});
