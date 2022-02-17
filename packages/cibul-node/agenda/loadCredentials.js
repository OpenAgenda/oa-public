'use strict';

module.exports = function loadCredentials(req, res, next) {
  const {
    agendas
  } = req.app.services;

  agendas.get({ uid: req.agenda.uid }, { internal: true, private: null }).then(agenda => {
    req.credentials = agenda?.credentials;
    next();
  }, next);
};
