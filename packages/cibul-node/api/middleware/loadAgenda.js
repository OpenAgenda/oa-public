'use strict';

module.exports = async (req, res, next) => {
  const {
    agendaSlug,
    agendaUid
  } = req.params;

  const identifier = agendaUid ? {
    uid: agendaUid
  } : {
    slug: agendaSlug
  };

  req.app.services.agendas.get(identifier, {
    private: null,
    internal: true
  }, (err, agenda) => {
    if (err) {
      return next(err);
    }

    if (!agenda) {
      return res.status(404).json({
        error: 'agenda not found',
        agendaUid: req.params.agendaUid
      });
    }

    req.agenda = agenda;

    next();
  });
};
