import schema from '@openagenda/validators/schema/index.js';
import text from '@openagenda/validators/text.js';
import link from '@openagenda/validators/link.js';
import pass from '@openagenda/validators/pass.js';
import bool from '@openagenda/validators/boolean.js';

schema.register({
  text,
  link,
  pass,
  bool,
});

export default schema({
  current: {
    list: true,
    fields: {
      link: {
        type: 'link',
        optional: false,
      },
      data: {
        type: 'pass',
        optional: false,
      },
    },
  },
  includeEmbedlessLinks: {
    type: 'bool',
    default: false,
  },
  filterInvalidLinks: {
    type: 'bool',
    default: false,
  },
  lazy: {
    type: 'bool',
    default: false,
  },
});
