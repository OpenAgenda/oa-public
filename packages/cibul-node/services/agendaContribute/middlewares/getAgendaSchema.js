'use strict';

module.exports = function getAgendaSchema(req, res, next) {
  const {
    core
  } = req.app;
  core.agendas(req.agenda.uid).get({
    detailed: true,
    access: 'internal'
  }).then(({ schema }) => {
    req.schema = schema;
    next();
  });
};
