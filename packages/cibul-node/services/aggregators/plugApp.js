'use strict';

const matchApp = require('./middleware/matchApp');
const legacyRemoveSource = require('./middleware/legacyRemoveSource');
const aggregatorSourcesMw = require('@openagenda/aggregator-sources').mw;

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
    agendas.mw.loadBy('uid'),
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
