'use strict';

const sentry = require('@sentry/node');

module.exports = function sentryErrorHandler(options) {
  const originalHandler = sentry.Handlers.errorHandler(options);

  return function sentryErrorMiddleware(err, req, res, next) {
    sentry.withScope(scope => {
      if (options?.tag) {
        scope.setTag(options.tag, true);

        scope.addEventProcessor(event => {
          event.transaction = `${options.tag} | ${event.transaction}`;
          return event;
        });
      }

      originalHandler(err, req, res, next);
    });
  };
};
