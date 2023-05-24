'use strict';

module.exports = function loadCredentials(req, res, next) {
  const {
    agendas,
  } = req.app.services;

  agendas.get({ uid: req.params.uid }, { internal: true, private: null }).then(agenda => {
    if (!agenda) {
      return next({ code: 404 });
    }
    req.credentials = agenda?.credentials;
    next();
  }, next);
};
