import schema from '@openagenda/validators/schema/index';
import pass from '@openagenda/validators/pass';
import text from '@openagenda/validators/text';
import integer from '@openagenda/validators/integer';

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
