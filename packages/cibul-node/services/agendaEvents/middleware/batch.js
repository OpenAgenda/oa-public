'use strict';

function getBatchMethod(method) {
  switch (method) {
    case 'PUT':
      return 'update';
    case 'DELETE':
      return 'remove'
    case 'PATCH':
      return 'patch';
    default:
      return null;
  }
}

module.exports = function batch(req, res, next) {
  const method = getBatchMethod(req.method);

  if (!method) {
    return next();
  }

  req.app.services.core.agendas(req.agenda.uid).events.batch(
    method,
    { state: null, ...req.query },
    req.body,
    { search: true, userUid: req.user.uid }
  ).then(() => {
    res.send({ batched: true });
  }, next);
};
