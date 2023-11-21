'use strict';

const _ = require('lodash');
const schema = require('@openagenda/validators/schema');

const choiceValidator = require('@openagenda/validators/choice');
const integerValidator = require('@openagenda/validators/integer');
const textValidator = require('@openagenda/validators/text');
const linkValidator = require('@openagenda/validators/link');
const dateValidator = require('@openagenda/validators/date');
const booleanValidator = require('@openagenda/validators/boolean');

schema.register({
  choice: choiceValidator,
  integer: integerValidator,
  text: textValidator,
  link: linkValidator,
  date: dateValidator,
  boolean: booleanValidator,
});

const writableFields = {
  flash: {
    type: 'text',
    max: 1000,
  },
  inbox: {
    lastRequestTime: {
      type: 'integer',
      default: 0,
    },
    lastKnownState: {
      type: 'boolean',
      default: false,
    },
  },
  notifications: {
    updatedAt: {
      type: 'date',
      default: null,
    },
    count: {
      type: 'integer',
      default: null,
    },
  },
};

const fields = {
  user: {
    optional: true,
    fields: {
      culture: {
        type: 'choice',
        optional: false,
        unique: true,
        options: ['fr', 'en', 'de', 'es', 'it', 'br', 'oc'],
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

module.exports = Object.assign(validate, {
  validateLogged,
  validateUnlogged,
  writable: validateWritable,
});
