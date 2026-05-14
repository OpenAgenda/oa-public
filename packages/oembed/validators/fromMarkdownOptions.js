import schema from '@openagenda/validators/schema/index';
import text from '@openagenda/validators/text';
import link from '@openagenda/validators/link';
import pass from '@openagenda/validators/pass';
import bool from '@openagenda/validators/boolean';

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
