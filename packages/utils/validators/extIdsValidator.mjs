import schema from '@openagenda/validators/schema';
import text from '@openagenda/validators/text';

schema.register({ text });

const validate = schema({
  list: true,
  fields: {
    key: { type: 'text', optional: false, max: 32 },
    value: { type: 'text', optional: true, max: 100 },
  },
});

export default (options = {}) =>
  (value) => {
    if ([undefined, null].includes(value) && options.optional) {
      return value;
    }

    return validate(value);
  };
