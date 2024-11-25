import schema from '@openagenda/validators/schema/index.js';
import text from '@openagenda/validators/text.js';

schema.register({ text });

const validate = schema({
  list: true,
  fields: {
    key: { type: 'text', optional: false },
    value: { type: 'text', optional: false },
  },
});

export default (options = {}) =>
  (value) => {
    if (!value && options.optional) return;
    return validate(value);
  };
