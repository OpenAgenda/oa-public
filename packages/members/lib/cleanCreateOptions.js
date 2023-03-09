'use strict';

const schema = require('@openagenda/validators/schema');
const boolean = require('@openagenda/validators/boolean');
const text = require('@openagenda/validators/text');
const integer = require('@openagenda/validators/integer');

schema.register({
  boolean,
  text,
  integer,
});

module.exports = schema({
  requireCustom: {
    type: 'boolean',
    default: true,
  },
  throwOnError: {
    type: 'boolean',
    default: false,
  },
  context: {
    lang: {
      type: 'text',
      default: null,
      max: 2,
    },
    sender: {
      userUid: {
        type: 'integer',
        default: null,
      },
      memberName: {
        type: 'text',
        default: null,
      },
    },
    message: {
      type: 'text',
      default: null,
    },
    redirect: {
      type: 'text',
      default: null,
    },
  },
});
