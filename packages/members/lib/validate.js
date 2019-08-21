'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  integer: require('@openagenda/validators/integer'),
  date: require('@openagenda/validators/date'),
  choice: require('@openagenda/validators/choice'),
  pass: require('@openagenda/validators/pass'),
  boolean: require('@openagenda/validators/boolean'),
  email: require('@openagenda/validators/email'),
  phone: require('@openagenda/validators/phone'),
  text: require('@openagenda/validators/text')
});

const roles = require('./roles');

const fields = {
  base: {
    agendaUid: {
      type: 'integer'
    },
    userUid: {
      type: 'integer'
    },
    createdAt: {
      type: 'date'
    },
    updatedAt: {
      type: 'date'
    },
    custom: {
      type: 'pass'
    },
    deletedUser: {
      type: 'boolean',
      default: false
    },
    role: {
      type: 'choice',
      unique: true,
      optional: false,
      options: Object.values(roles)
    }
  },
  legacy: {
    userId: {
      type: 'integer'
    },
    agendaId: {
      type: 'integer'
    },
    actionsCounter: {
      type: 'integer'
    },
    credential: {
      type: 'choice',
      unique: true,
      options: Object.values(roles)
    }
  }
};

const custom = required => ({
  organization: {
    type: 'text',
    optional: !required,
    max: 255
  },
  contactName: {
    type: 'text',
    optional: !required,
    max: 255
  },
  contactNumber: {
    type: 'phone',
    optional: !required,
    limit: 255
  },
  contactPosition: {
    type: 'text',
    optional: !required,
    limit: 255
  },
  email: {
    type: 'email',
    optional: !required
  }
});

module.exports = Object.assign(schema(fields.base), {
  withLegacy: schema({ ...fields.base, ...fields.legacy }),
  withCustom: required => schema({ ...fields.base, custom: custom(required) }),
  custom: required => schema(custom(required))
});
