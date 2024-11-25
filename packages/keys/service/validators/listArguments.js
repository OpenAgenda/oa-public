import schema from '@openagenda/validators/schema/index.js';
import choice from '@openagenda/validators/choice.js';
import text from '@openagenda/validators/text.js';
import number from '@openagenda/validators/number.js';
import pass from '@openagenda/validators/pass.js';

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
