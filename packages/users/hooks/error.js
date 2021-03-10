'use strict';

const { inspect } = require('util');
const _ = require('lodash');
const debug = require('debug');
const VError = require('verror');
const log = require('@openagenda/logs')('users/hooks/error');

module.exports = () => async function errorHook(context, next) {
  try {
    await next();
  } catch (error) {
    // Avoid not found error
    if (
      error.name === 'NotFound'
        && error.message.includes('No record found')
    ) {
      context.result = null;
      return context;
    }

    context.error = error;

    if (error.name !== 'NotFound') {
      const errorStack = context.error instanceof Error
        ? `\n${VError.fullStack(context.error)}`
        : '';

      log.error(
        `Error in service method '${context.method}'${errorStack}\n`,
        inspect(_.omit(context.error, ['hook.app', 'hook.service']), {
          colors: debug.useColors(),
        })
      );
    }

    throw error;
  }
};
