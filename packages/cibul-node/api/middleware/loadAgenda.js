// eslint-disable-next-line no-control-regex
const format = /[^\u0000-\u00ff]/;

export default async (req, res, next) => {
  const { simpleCache, agendas } = req.app.services;

  const { agendaSlug, agendaUid } = req.params;

  const identifier = agendaUid
    ? {
      uid: agendaUid,
    }
    : {
      slug: agendaSlug,
    };

  if (identifier.slug && format.test(identifier.slug)) {
    return res.status(400).json({
      error: 'no unicode char in slug',
      agendaSlug: identifier.slug,
    });
  }

  req.agenda = await simpleCache
    .hash('agendas', agendaUid || agendaSlug)
    .get('api', { json: true });

  if (req.agenda) {
    return next();
  }

  try {
    const agenda = await agendas.get(identifier, {
      private: null,
      internal: true,
    });

    if (!agenda) {
      return res.status(404).json({
        error: 'agenda not found',
        agendaUid: req.params.agendaUid,
      });
    }

    simpleCache.hash('agendas', agendaUid || agendaSlug).set('api', agenda);

    req.agenda = agenda;

    next();
  } catch (err) {
    return next(err);
  }
};
