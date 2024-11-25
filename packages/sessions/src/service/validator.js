import schema from '@openagenda/validators/schema/index.js';
import booleanValidator from '@openagenda/validators/boolean.js';
import choiceValidator from '@openagenda/validators/choice.js';
import integerValidator from '@openagenda/validators/integer.js';
import emailValidator from '@openagenda/validators/email.js';
import textValidator from '@openagenda/validators/text.js';
import dateValidator from '@openagenda/validators/date.js';
import linkValidator from '@openagenda/validators/link.js';
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
