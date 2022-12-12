'use strict';

module.exports = async (req, res, next) => {
  const {
    simpleCache,
    agendas,
  } = req.app.services;

  const {
    agendaSlug,
    agendaUid,
  } = req.params;

  const identifier = agendaUid ? {
    uid: agendaUid,
  } : {
    slug: agendaSlug,
  };

  req.agenda = await simpleCache.hash('agendas', agendaUid || agendaSlug).get('api', { json: true });

  if (req.agenda) {
    return next();
  }

  agendas.get(identifier, {
    private: null,
    internal: true,
  }, (err, agenda) => {
    if (err) {
      return next(err);
    }

    if (!agenda) {
      return res.status(404).json({
        error: 'agenda not found',
        agendaUid: req.params.agendaUid,
      });
    }

    simpleCache.hash('agendas', agendaUid || agendaSlug).set('api', agenda);

    req.agenda = agenda;

    next();
  });
};
