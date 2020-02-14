"use strict";

const VError = require('verror');

module.exports = async (req, res, next) => {
  try {
    res.json(await req.app.core.agendas(req.agenda.uid).settings.batchResync(req.parsedData));
  } catch (e) {
    next(new VError(e, 'agenda settings resync error'));
  }
}
