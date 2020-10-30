'use strict';

module.exports = async (req, res, next) => res.json({
  form: await req.app.services.core
    .agendas(req.agenda.uid).settings.get()
    .then(r => r.fields, next)
});
