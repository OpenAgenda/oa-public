'use strict';

const bodyParser = require('body-parser');

module.exports = (config, parentApp) => {
  const {
    sessions,
    agendas,
    members,
    aggregators
  } = parentApp.services;

  // this stays
  parentApp.all([
    '/:agendaSlug/admin/aggregator',
    '/:agendaSlug/admin/sources(/*?)?',
    '/:agendaSlug/admin/sources/remove',
  ], [
    sessions.mw.loadOrRedirect(),
    agendas.mw.load,
    agendas.mw.authorizeByIPAddress(),
    members.mw.loadAndAuthorize('administrator')
  ]);

  parentApp.get('/:agendaSlug/admin/sources', (req, res, next) => {
    res.vary('Accept');

    if (req.accepts(['json', 'html']) !== 'json') {
      return next();
    }

    aggregators.sources
      .list(req.agenda, {
        search: req.query.search,
        slug: req.query.slug
      }, { detailed: true })
      .then(
        sources => {
          res.json({ sources });
        },
        err => {
          if (err.message === 'Aggregator not found') {
            return res.status(404).send(err.message);
          }

          next(err);
        }
      );
  });

  parentApp.post(
    '/:agendaSlug/admin/sources',
    bodyParser.json(),
    agendas.mw.loadBy({
      path: 'body.agendaUid',
      field: 'uid',
      target: 'sourceAgenda'
    }),
    (req, res, next) => aggregators.sources.add(
      req.agenda,
      req.sourceAgenda,
      req.body.rules,
      { evaluate: [true, 1, 'true', '1'].includes(req.query.evaluate) }
    ).then(res.json.bind(res), next)
  );

  parentApp.get(
    '/:agendaSlug/admin/aggregator',
    bodyParser.json(),
    (req, res, next) => aggregators
      .get(req.agenda.uid, { detailed: true })
      .then(result => {
        if (!result) {
          return res.status(404).send('Aggregator not found');
        }

        res.json(result);
      }, next)
  );

  parentApp.post(
    '/:agendaSlug/admin/aggregator',
    bodyParser.json(),
    (req, res, next) => aggregators
      .set(req.agenda.uid, req.body)
      .then(result => res.json(result), next)
  );

  parentApp.put(
    '/:agendaSlug/admin/sources/:sourceId',
    bodyParser.json(),
    (req, res, next) => aggregators.sources.update(
      req.agenda,
      req.params.sourceId,
      req.body.rules
    ).then(res.json.bind(res), next)
  );

  parentApp.delete(
    '/:agendaSlug/admin/sources/:sourceId',
    (req, res, next) => aggregators.sources.remove(
      req.agenda,
      req.params.sourceId,
      { evaluate: [true, 1, 'true', '1'].includes(req.query.evaluate) }
    ).then(res.json.bind(res), next)
  );

  parentApp.get(
    '/agendas/:uid/sources.json',
    agendas.mw.loadBy({ path: 'params.uid', field: 'uid' }),
    (req, res, next) => aggregators.sources
      .list(req.agenda, {}, { detailed: true })
      .then(sources => res.json({
        total: sources.length,
        agendas: sources.map(source => source.agenda)
      }), next)
  );
};
