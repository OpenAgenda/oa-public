import schema from '@openagenda/validators/schema/index';
import text from '@openagenda/validators/text';

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
