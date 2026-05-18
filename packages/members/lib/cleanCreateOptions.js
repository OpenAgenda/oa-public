import schema from '@openagenda/validators/schema/index';
import boolean from '@openagenda/validators/boolean';
import text from '@openagenda/validators/text';
import integer from '@openagenda/validators/integer';

schema.register({
  boolean,
  text,
  integer,
});

export default schema({
  requireCustom: {
    type: 'boolean',
    default: true,
  },
  throwOnError: {
    type: 'boolean',
    default: false,
  },
  context: {
    lang: {
      type: 'text',
      default: null,
      max: 2,
    },
    sender: {
      userUid: {
        type: 'integer',
        default: null,
      },
      memberName: {
        type: 'text',
        default: null,
      },
    },
    message: {
      type: 'text',
      default: null,
    },
    redirect: {
      type: 'text',
      default: null,
    },
    silent: {
      type: 'boolean',
      default: false,
    },
  },
});
