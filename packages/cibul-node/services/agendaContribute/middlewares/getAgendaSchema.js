'use strict';

module.exports = function getAgendaSchema(req, res, next) {
  const {
    core
  } = req.app;
  core.agendas(req.agenda.uid).get({
    private: req.member ? null : false,
    detailed: true,
    access: 'internal',
    includeEvent: true
  }).then(({ schema }) => {
    req.schema = schema;
    next();
  });
};
