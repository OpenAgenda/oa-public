export default function verifyHeadersPassword(req, res, next) {
  const { users } = req.app.services;

  if (req.APIType && req.APIType === 'standalone') {
    return next();
  }

  users
    .verifyPassword(req.headers.authorization.replace(/^Basic\s/, ''), {
      query: { email: req.user.email },
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
