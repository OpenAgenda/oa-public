import _ from 'lodash';
import schema from '@openagenda/validators/schema/index';
import choiceValidator from '@openagenda/validators/choice';
import integerValidator from '@openagenda/validators/integer';
import textValidator from '@openagenda/validators/text';
import linkValidator from '@openagenda/validators/link';
import dateValidator from '@openagenda/validators/date';

schema.register({
  choice: choiceValidator,
  integer: integerValidator,
  text: textValidator,
  link: linkValidator,
  date: dateValidator,
});

const writableFields = {
  flash: {
    type: 'text',
    max: 1000,
  },
};

const fields = {
  user: {
    optional: true,
    fields: {
      culture: {
        type: 'text',
        min: 2,
        max: 2,
        optional: false,
      },
      uid: {
        type: 'integer',
        optional: false,
      },
      name: {
        type: 'text',
        optional: false,
      },
      thumbnail: {
        type: 'link',
        optional: true,
      },
    },
  },
  expires: {
    type: 'date',
    optional: true,
    default: undefined,
  },
  sessionId: {
    type: 'text',
    optional: true,
  },
};

const validateUnlogged = schema(_.omit(fields, ['user']));
const validateLogged = schema(fields);

function validate(dirty) {
  if (dirty && _.isObject(dirty) && !dirty.user) {
    return validateUnlogged(dirty);
  }

  return validateLogged(dirty);
}

const validateWritable = schema(writableFields);

export default validate;

export { validateLogged, validateUnlogged, validateWritable as writable };
