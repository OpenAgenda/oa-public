export default function verifyHeadersPassword(req, res, next) {
  const { users } = req.app.services;

  if (req.APIType && req.APIType === 'standalone') {
    return next();
  }

  users
    .verifyPassword(req.headers.authorization.replace(/^Basic\s/, ''), {
      query: { email: req.user.email },
    })
    .then((isValid) => {
      if (!isValid) {
        res.status(403).send();
        return;
      }
      next();
    });
}
