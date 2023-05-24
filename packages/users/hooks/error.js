'use strict';

const log = require('@openagenda/logs')('users/hooks/error');

module.exports = () =>
  async function errorHook(context, next) {
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

      const statusCode = error.statusCode || error.code || 500;

      if (statusCode >= 500) {
        log.error(`Error in service method '${context.method}'`, error);
      }

      throw error;
    }
  };
