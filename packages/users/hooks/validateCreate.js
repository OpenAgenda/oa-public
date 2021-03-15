'use strict';

const _ = require('lodash');
const { isProvider } = require('feathers-hooks-common');
const createSchema = require('../service/schemas/create');
const validate = require('./validate');

module.exports = function validateCreate() {
  return context => validate({
    ...createSchema,
    // Allow server to create an activated user
    ...(isProvider('server')(context)
      ? {
        isActivated: {
          type: 'boolean',
          default: false,
        },
      }
      : {}),
    // Allow password to be optional for a social registration
    ...(['twitterId', 'googleId', 'facebookUid'].some(key => _.get(context.data, key))
      ? {
        password: {
          type: 'text',
          min: 4,
          optional: true,
        },
      }
      : {}),
  })(context);
};
