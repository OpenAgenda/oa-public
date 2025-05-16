import Shares from '@openagenda/shares';

function share(req, res, next) {
  const { core } = req.app.services;
  const config = core.getConfig();

  const shares = Shares(config.shares.agenda);

  if (!shares.has(req.params.service)) {
    return next({
      code: 404,
      message: 'This share type does not exist',
    });
  }

  if (!req.agenda) {
    return next({
      code: 404,
      message: 'Agenda not found',
    });
  }

  req.log.info({
    message: 'sharing agenda',
    uid: req.agenda.uid,
    slug: req.agenda.slug,
    service: req.params.service,
  });

  res.redirect(
    shares.getLink(req.params.service, {
      title: req.agenda.title,
      description: req.agenda.description,
      url: req.genUrl(
        'agendaShow',
        { slug: req.agenda.slug },
        { abs: true, protocol: 'https://' },
      ),
      siteUrl: config.root,
    }),
  );
}

export default (app) => {
  const { agendas: agendasSvc } = app.services;
  app.get(
    '/:slug/share/:service',
    agendasSvc.middleware.load({
      internal: true,
      namespaces: {
        identifiers: {
          slug: 'params.slug',
        },
      },
    }),
    share,
  );
};
