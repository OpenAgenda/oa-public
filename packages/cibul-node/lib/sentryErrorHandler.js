'use strict';

const sentry = require('@sentry/node');

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

module.exports = function sentryErrorHandler(options) {
  const originalHandler = sentry.Handlers.errorHandler(options);

  return function sentryErrorMiddleware(err, req, res, next) {
    if (isObject(err)) {
      const statusCode = err.statusCode || err.code || 500;

      if (Number.isInteger(statusCode) && statusCode < 500) {
        return next(err);
      }
    }

    sentry.withScope(scope => {
      if (options?.tag) {
        scope.setTag(options.tag, true);

        scope.addEventProcessor(event => {
          event.transaction = `${options.tag}${event.transaction ? ` | ${event.transaction}` : ''}`;
          return event;
        });
      }

      originalHandler(err, req, res, next);
    });
  };
};
