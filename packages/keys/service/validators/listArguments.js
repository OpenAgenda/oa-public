import schema from '@openagenda/validators/schema/index';
import choice from '@openagenda/validators/choice';
import text from '@openagenda/validators/text';
import number from '@openagenda/validators/number';
import pass from '@openagenda/validators/pass';

schema.register({
  choice,
  text,
  number,
  pass,
});

export default (args) => {
  const validate = schema({
    query: {
      type: 'pass',
    },
    offset: {
      type: 'number',
      default: 0,
    },
    limit: {
      type: 'number',
      default: 20,
    },
    options: {
      type: 'pass',
    },
  });

  return validate(args);
};
