'use strict';

const schema = require('@openagenda/validators/schema');
const extend = require('lodash/extend');

const booleanValidator = require('@openagenda/validators/boolean');
const choiceValidator = require('@openagenda/validators/choice');
const integerValidator = require('@openagenda/validators/integer');
const emailValidator = require('@openagenda/validators/email');
const textValidator = require('@openagenda/validators/text');
const dateValidator = require('@openagenda/validators/date');
const linkValidator = require('@openagenda/validators/link');

const { fields: cookieUserFields } = require('../../iso/cookie.validate').validateLogged.fields.user;

schema.register({
  boolean: booleanValidator,
  choice: choiceValidator,
  integer: integerValidator,
  email: emailValidator,
  text: textValidator,
  date: dateValidator,
  link: linkValidator,
});

module.exports = schema(extend({
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
}, cookieUserFields));
