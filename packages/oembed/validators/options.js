import schema from '@openagenda/validators/schema/index.js';
import text from '@openagenda/validators/text.js';

schema.register({
  text,
});

export default schema({
  iframely: {
    key: {
      type: 'text',
      optional: false,
    },
    res: {
      type: 'text',
      default: 'https://iframe.ly/api/oembed',
    },
  },
  filters: {
    type: 'text',
    list: true,
    default: [],
  },
});
