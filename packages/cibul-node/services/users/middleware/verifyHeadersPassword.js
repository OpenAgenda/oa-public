export default function verifyHeadersPassword(req, res, next) {
  const { users } = req.app.services;

  if (req.APIType && req.APIType === 'standalone') {
    return next();
  }

  users
    .verifyPassword(req.headers.authorization.replace(/^Basic\s/, ''), {
      // Identify by stable uid, not the session email — the email can be stale
      // right after a change, and a lookup by a no-longer-current email throws
      // NotFound. Mirrors hooks/verifyHeadersPassword.js.
      query: { uid: req.user.uid },
    })
    .then(
      (isValid) => {
        if (!isValid) {
          res.status(403).send();
          return;
        }
        next();
      },
      // Without this, an unexpected throw inside `verifyPassword` (e.g. a
      // future regression on the legacy/BA dual-state) leaves the request
      // hanging until Node's keep-alive timer fires — the client sees a
      // browser-level "took too long to respond" with no diagnostic. Pass
      // the error to Express so the standard error pipeline produces a 500
      // and the failure surfaces in the access log.
      next,
    );
}
