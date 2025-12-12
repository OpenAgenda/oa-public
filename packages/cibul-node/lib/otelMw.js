import { trace } from '@opentelemetry/api';

function setAttributes({ req, span }, key, value) {
  if (value === undefined) {
    return;
  }

  span?.setAttribute(key, value);
  (req.otelAttributes ?? {})[key] = value;
}

export function addUserContext(req, res, next) {
  const { services } = req.app;
  const span = trace.getActiveSpan();

  setAttributes({ req, span }, 'session.id', req.session?.sessionId);
  setAttributes({ req, span }, 'user.uid', req.user?.uid);
  setAttributes(
    { req, span },
    'process.hostname',
    services.monitor?.processInfo?.hostname,
  );
  setAttributes(
    { req, span },
    'process.name',
    services.monitor?.processInfo?.processName,
  );

  next();
}
