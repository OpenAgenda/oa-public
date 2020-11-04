'use strict';

module.exports = async (req, res, next) => res.json(
  await req.app.core.agendas(req.agenda.uid)
    .settings.batchResync(req.parsedData)
    .catch(next)
);
