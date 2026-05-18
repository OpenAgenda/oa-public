import schema from '@openagenda/validators/schema/index';
import integerValidator from '@openagenda/validators/integer';
import textValidator from '@openagenda/validators/text';

schema.register({
  integer: integerValidator,
  text: textValidator,
});

const validate = schema({
  uid: {
    type: 'integer',
    optional: true,
  },
  secretKey: {
    type: 'text',
    optional: true,
  },
});

export default (dirty, options = {}) => {
  const clean = validate(dirty instanceof Object ? dirty : { uid: dirty });

  if (options.pickOne) {
    const field = Object.keys(clean).filter((key) => !!clean[key])[0];
    return {
      [field]: clean[field],
    };
  }

  return clean;
};
