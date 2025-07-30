import { trace } from '@opentelemetry/api';

export function addUserContext(req, res, next) {
  const span = trace.getActiveSpan();

  req.otelAttributes = req.otelAttributes ?? {};

  span?.setAttribute('session.id', req.session?.sessionId);
  req.otelAttributes['session.id'] = req.session?.sessionId;

  if (req.user?.uid) {
    span?.setAttribute('user.uid', req.user.uid);
    req.otelAttributes['user.uid'] = req.user.uid;
  }

  next();
}
