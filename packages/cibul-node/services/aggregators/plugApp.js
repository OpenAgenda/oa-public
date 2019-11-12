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
    '/:agendaSlug/admin/sources',
    '/:agendaSlug/admin/sources/?*?',
    '/:agendaSlug/admin/sources/remove',
  ], [
    sessions.mw.loadOrRedirect,
    agendas.mw.load,
    members.mw.loadAndAuthorize('administrator')
  ]);

  parentApp.get('/:agendaSlug/admin/sources', ( req, res, next) => {
    if (req.accepts(['json', 'html']) !== 'json') {
      return next();
    }

    aggregators.sources
      .list(req.agenda, { search: req.query.search }, { detailed: true })
      .then(sources => res.json({ sources }), next);
  });

  parentApp.post('/:agendaSlug/admin/sources',
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

  parentApp.put('/:agendaSlug/admin/sources/:sourceId',
    bodyParser.json(),
    (req, res, next) => aggregators.sources.update(
      req.agenda,
      req.params.sourceId,
      req.body.rules
    ).then(res.json.bind(res), next)
  );

  parentApp.delete('/:agendaSlug/admin/sources/:sourceId',
    (req, res, next) => aggregators.sources.remove(
      req.agenda,
      req.params.sourceId,
      { evaluate: [true, 1, 'true', '1'].includes(req.query.evaluate) }
    ).then(res.json.bind(res), next)
  );

  parentApp.get(
    '/agendas/:uid/sources.json',
    agendas.mw.loadBy({path: 'params.uid', field: 'uid' }),
    (req, res, next) => aggregators.sources
      .list(req.agenda, {}, { detailed: true })
      .then(sources => res.json({
        total: sources.length,
        agendas: sources.map(source => source.agenda)
      }), next)
  );
}
