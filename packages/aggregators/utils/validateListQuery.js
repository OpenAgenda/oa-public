import schema from '@openagenda/validators/schema/index';
import text from '@openagenda/validators/text';

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
