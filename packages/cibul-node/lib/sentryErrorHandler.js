import * as Sentry from '@sentry/node';
import { context, trace } from '@opentelemetry/api';
import express from 'express';

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

export default function sentryErrorHandler(options) {
  const router = express.Router({ mergeParams: true });

  router.use((req, res, next) => {
    const span = trace.getSpan(context.active());

    Sentry.withScope((scope) => {
      if (options?.tag) {
        scope.setTag(options.tag, true);

        if (span?.attributes) {
          scope.setTags(span.attributes);
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
