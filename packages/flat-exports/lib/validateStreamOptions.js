import schema from '@openagenda/validators/schema/index.js';
import pass from '@openagenda/validators/pass.js';
import text from '@openagenda/validators/text.js';
import integer from '@openagenda/validators/integer.js';

schema.register({
  pass,
  text,
  integer,
});

export default schema({
  genUrl: {
    type: 'pass',
    default: null,
  },
  lang: {
    type: 'text',
    default: 'fr',
  },
  slug: {
    type: 'text',
    optional: false,
  },
  identifier: {
    type: 'integer',
    optional: false,
  },
  type: {
    type: 'text',
    default: 'agenda',
  },
  title: {
    type: 'text',
    optional: false,
  },
  description: {
    type: 'text',
  },
  section: {
    type: 'text',
  },
});
