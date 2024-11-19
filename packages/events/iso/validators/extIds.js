import schema from '@openagenda/validators/schema/index.js';
import text from '@openagenda/validators/text.js';

schema.register({ text });

export default () =>
  schema({
    list: true,
    fields: {
      key: { type: 'text', optional: false },
      value: { type: 'text', optional: false },
    },
  });
