'use strict';

const matchApp = require('./middleware/matchApp');
const legacyRemoveSource = require('./middleware/legacyRemoveSource');
const aggregatorSourcesMw = require('@openagenda/aggregator-sources').mw;
const bodyParser = require('body-parser');

module.exports = (config, parentApp) => {
  const {
    sessions,
    agendas,
    members,
    aggregators,
    activities,
    aggregatorSources
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

  parentApp.get('/:agendaSlug/admin/sources/refactor', ( req, res, next) => {
    if (!req.xhr) return next();
    aggregators.sources
      .list(req.agenda, { detailed: true })
      .then(sources => res.json(sources));
  });

  parentApp.post('/:agendaSlug/admin/sources/refactor',
    bodyParser.json(),
    agendas.mw.loadBy({
      path: 'body.agendaUid',
      field: 'uid',
      target: 'sourceAgenda'
    }),
    (req, res, next) => aggregators.sources.add(
      req.agenda,
      req.sourceAgenda,
      req.body.rules
    ).then(res.json, next)
  );

  parentApp.put('/:agendaSlug/admin/sources/refactor/:sourceId',
    bodyParser.json(),
    (req, res, next) => aggregators.sources.update(
      req.agenda,
      req.params.sourceId,
      req.body.rules
    ).then(res.json, next)
  );

  parentApp.delete('/:agendaSlug/admin/sources/refactor/:sourceId',
    (req, res, next) => aggregators.sources.remove(
      req.agenda,
      req.params.sourceId
    ).then(res.json, next)
  );

  // this will be removed when new aggregator source app is ready
  parentApp.get(
    '/:agendaSlug/admin/sources/agenda-sources.json',
    sessions.mw.loadOrRedirect,
    agendas.mw.load,
    members.mw.loadAndAuthorize('administrator'),
    aggregatorSourcesMw.list.bind(null, { send: true })
  );

  parentApp.get(
    '/agendas/:uid/sources.json',
    agendas.mw.loadBy({path: 'params.uid', field: 'uid' }),
    aggregatorSourcesMw.list.bind( null, { send: false } ),
    ( req, res, next ) => res.json( {
      total: req.result.total,
      agendas: req.result.reviews
    } )
  );

  parentApp.get('/:slug/admin/sources/remove',
    legacyRemoveSource.bind(null, parentApp.services)
  );

  parentApp.all([
    '/:agendaSlug/admin/sources',
    '/:agendaSlug/admin/sources/?*?',
  ], [
    populateIsAggregator.bind(null, aggregators),
    matchApp.bind(null, config)
  ]);

}

function populateIsAggregator(aggregators, req, res, next) {
  aggregators.get(req.agenda.uid).then(agg => {
    req.isAggregator = !!agg;
    next();
  }, next);
}
