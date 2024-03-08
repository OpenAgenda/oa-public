'use strict';

module.exports = function verifyHeadersPassword(req, res, next) {
  const {
    users,
  } = req.app.services;

  users.verifyPassword(req.headers.authorization.replace(/^Basic\s/, ''), {
    query: { email: req.user.email },
  }).then(isValid => {
    if (!isValid) {
      res.status(403).send();
      return;
    }
    next();
  });
};
