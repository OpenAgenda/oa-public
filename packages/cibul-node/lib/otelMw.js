export function addUserContext(req, res, next) {
  req.otelAttributes = req.otelAttributes ?? {};

  req.otelAttributes['session.id'] = req.session?.sessionId;

  if (req.user?.uid) {
    req.otelAttributes['user.uid'] = req.user.uid;
  }

  next();
}
