import schema from '@openagenda/validators/schema/index';
import booleanValidator from '@openagenda/validators/boolean';
import choiceValidator from '@openagenda/validators/choice';
import integerValidator from '@openagenda/validators/integer';
import emailValidator from '@openagenda/validators/email';
import textValidator from '@openagenda/validators/text';
import dateValidator from '@openagenda/validators/date';
import linkValidator from '@openagenda/validators/link';
import { validateLogged } from '../iso/cookie.validate.js';

const { fields: cookieUserFields } = validateLogged.fields.user;

schema.register({
  boolean: booleanValidator,
  choice: choiceValidator,
  integer: integerValidator,
  email: emailValidator,
  text: textValidator,
  date: dateValidator,
  link: linkValidator,
});

export default (config) =>
  schema({
    id: {
      type: 'integer',
      optional: false,
    },
    email: {
      type: 'email',
    },
    latestActivity: {
      type: 'date',
    },
    expires: {
      type: 'date',
    },
    isNew: {
      type: 'boolean',
    },
    isBlacklisted: {
      type: 'boolean',
      default: false,
    },
    transverseApiAccess: {
      type: 'boolean',
      default: false,
    },
    ...cookieUserFields,
    culture: {
      type: 'choice',
      optional: false,
      unique: true,
      options: config.cultures,
    },
  });
