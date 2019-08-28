'use strict';

const { inspect } = require('util');
const _ = require('lodash');
const debug = require('debug');
const VError = require('verror');
const { disallow } = require('feathers-hooks-common');
const log = require('@openagenda/logs')('users/tokens/hooks');
const {
  callInterface,
  camelCase,
  camelCaseQuery,
  snakeCase,
  snakeCaseQuery,
  generateToken
} = require('../hooks/index');

module.exports = {
  before: {
    all: disallow('external'),
    find: [
      context => {
        const query = context.params.query || {};

        switch (query.type) {
          case 'activateAccount':
            query.type = 'aa';
            break;
          case 'lostPassword':
            query.type = 'lp';
            break;
          default:
            break;
        }

        context.params.query = query;
      },
      snakeCase(),
      snakeCaseQuery()
    ],
    get: [snakeCase(), snakeCaseQuery()],
    create: [
      generateToken('data.token'),
      context => {
        switch (context.data.type) {
          case 'activateAccount':
            context.data.type = 'aa';
            break;
          case 'lostPassword':
            context.data.type = 'lp';
            break;
          default:
            break;
        }
      },
      snakeCase(),
      snakeCaseQuery()
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [camelCase(), camelCaseQuery()],
    find: [],
    get: [
      async context => {
        if (!context.result && context.params.createIfNotExist) {
          context.result = await this.create(
            _.pick(context.params.query, 'email', 'type', 'userId')
          );
        }
      }
    ],
    create: [callInterface('sendToken')],
    update: [],
    patch: [],
    remove: []
  },

  error(context) {
    // Avoid soft delete error
    if (
      _.get(context, 'error.name') === 'NotFound'
      && context.error.message.includes('No record found')
    ) {
      context.error = null;
      context.result = null;
      return context;
    }

    if (!(_.get(context, 'error.name') === 'NotFound')) {
      const errorStack = context.error instanceof Error
        ? VError.fullStack(context.error)
        : context.error;

      log.error(
        `Error in service method '${context.method}'\n${errorStack}\n`,
        typeof context.error === 'object'
          ? inspect(_.omit(context.error, ['hook.app', 'hook.service']), {
            colors: debug.useColors()
          })
          : undefined
      );
    }
  }
};
