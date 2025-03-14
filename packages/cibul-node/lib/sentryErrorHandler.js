import * as Sentry from '@sentry/node';
import context from '@openagenda/logs/context.js';
import express from 'express';

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

export default function sentryErrorHandler(options) {
  const router = express.Router({ mergeParams: true });

  router.use((req, res, next) => {
    Sentry.withScope((scope) => {
      if (options?.tag) {
        scope.setTag(options.tag, true);

        const store = context.getStore();

        if (store) {
          scope.setTags(store);
        }

        scope.addEventProcessor((event) => {
          event.transaction = `${options.tag}${event.transaction ? ` | ${event.transaction}` : ''}`;
          return event;
        });
      }

      next();
    });
  });

  Sentry.setupExpressErrorHandler(router, {
    shouldHandleError(error) {
      if (isObject(error)) {
        const statusCode = error.statusCode || error.code || 500;

        if (Number.isInteger(statusCode) && statusCode < 500) {
          return false;
        }
      }

      return true;
    },
  });

  return router;
}
