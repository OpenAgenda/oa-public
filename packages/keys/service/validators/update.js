import schema from '@openagenda/validators/schema/index.js';
import text from '@openagenda/validators/text.js';

schema.register({
  text,
});

export default (data) => {
  const validate = schema({
    label: {
      type: 'text',
      max: 255,
      default: null,
    },
  });

  return validate(data);
};
