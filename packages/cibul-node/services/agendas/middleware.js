'use strict';

module.exports = agendasSvc => ({
  load: loadBy.bind(null, agendasSvc)({ param: 'agendaSlug', field: 'slug' }),
  loadBy: loadBy.bind(null, agendasSvc)
});

function loadBy(agendasSvc, paramField) {
  return (req, res, next) => {
    const param = typeof paramField === 'string' ? paramField : paramField.param;
    const field = typeof paramField === 'string' ? paramField : paramField.field;
    agendasSvc.get({
      [field]: req.params[param]
    }, {
      private: null,
      internal: true,
      includeImagePath: true
    }).then(agenda => {
      if (!agenda) return next({
        code: 404
      });
      req.agenda = agenda;
      next();
    });
  }
}
