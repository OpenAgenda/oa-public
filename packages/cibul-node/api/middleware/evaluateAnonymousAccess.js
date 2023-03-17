'use strict';

const { Forbidden } = require('@openagenda/verror');

function evaluateAnonymousAccess(req, _res, next) {
  const isUIAPICall = req.baseUrl === '/api';

  if (isUIAPICall) {
    return next();
  }

  if (!req.user && !req.agendaKey) {
    return next(new Forbidden('not authorized to read event'));
  }

  next();
}

module.exports = evaluateAnonymousAccess;
