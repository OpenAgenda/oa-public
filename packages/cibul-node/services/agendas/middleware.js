'use strict';

const _ = require('lodash');

module.exports = agendasSvc => ({
  load: loadBy.bind(null, agendasSvc)({ path: 'params.agendaSlug', field: 'slug' }),
  loadBy: loadBy.bind(null, agendasSvc)
});

function loadBy(agendasSvc, { path, field, target }) {
  return (req, res, next) => {
    agendasSvc.get({
      [field]: _.get(req, path)
    }, {
      private: null,
      internal: true,
      includeImagePath: true
    }).then(agenda => {
      if (!agenda) return next({ code: 404 });
      req[target || 'agenda'] = agenda;
      next();
    });
  }
}
