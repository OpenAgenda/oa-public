import schema from '@openagenda/validators/schema/index.js';
import text from '@openagenda/validators/text.js';

schema.register({
  text,
});

export default schema({
  search: {
    type: 'text',
    default: null,
  },
  slug: {
    type: 'text',
    default: null,
  },
});
