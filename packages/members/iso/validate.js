import schema from '@openagenda/validators/schema/index.js';
import integer from '@openagenda/validators/integer.js';
import date from '@openagenda/validators/date.js';
import choice from '@openagenda/validators/choice.js';
import pass from '@openagenda/validators/pass.js';
import boolean from '@openagenda/validators/boolean.js';
import email from '@openagenda/validators/email.js';
import phone from '@openagenda/validators/phone.js';
import text from '@openagenda/validators/text.js';
import roles from './roles.js';

schema.register({
  integer,
  date,
  choice,
  pass,
  boolean,
  email,
  phone,
  text,
});

const fields = {
  base: {
    agendaUid: {
      type: 'integer',
      default: null,
    },
    userUid: {
      type: 'integer',
      default: null,
    },
    createdAt: {
      type: 'date',
    },
    updatedAt: {
      type: 'date',
    },
    custom: {
      type: 'pass',
    },
    deletedUser: {
      type: 'boolean',
      default: false,
    },
    role: {
      type: 'choice',
      unique: true,
      optional: false,
      options: Object.values(roles),
    },
    actionsCounter: {
      type: 'integer',
      default: 0,
    },
  },
  legacy: {
    credential: {
      type: 'choice',
      unique: true,
      options: Object.values(roles),
    },
  },
};

const custom = (required) => ({
  organization: {
    type: 'text',
    optional: !required,
    max: 255,
  },
  contactName: {
    type: 'text',
    optional: !required,
    max: 255,
  },
  contactNumber: {
    type: 'phone',
    optional: !required,
    limit: 255,
  },
  contactPosition: {
    type: 'text',
    optional: !required,
    limit: 255,
  },
  email: {
    type: 'email',
    optional: !required,
  },
});

export default Object.assign(schema(fields.base), {
  withLegacy: schema({ ...fields.base, ...fields.legacy }),
  withCustom: (required) =>
    schema({ ...fields.base, custom: custom(required) }),
  custom: (required) => schema(custom(required)),
});
