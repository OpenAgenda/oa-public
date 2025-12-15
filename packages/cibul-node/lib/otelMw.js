import { trace } from '@opentelemetry/api';

function setAttributes({ req, span }, key, value) {
  if (value === undefined) {
    return;
  }
  if (req.otelAttributes === undefined) {
    req.otelAttributes = {};
  }

  span?.setAttribute(key, value);
  req.otelAttributes[key] = value;
}

export function addUserContext(req, res, next) {
  const { services } = req.app;
  const span = trace.getActiveSpan();

  setAttributes({ req, span }, 'session.id', req.session?.sessionId);
  setAttributes({ req, span }, 'user.uid', req.user?.uid);
  setAttributes(
    { req, span },
    'hostname',
    services.monitor?.processInfo?.hostname,
  );
  setAttributes(
    { req, span },
    'processName',
    services.monitor?.processInfo?.processName,
  );

  next();
}
