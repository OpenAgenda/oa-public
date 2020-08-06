'use strict';

const _ = require('lodash');
const expressUtils = require('@openagenda/utils/express');
const gaTrack = require('../../../lib/gaTrack.mw');

module.exports = (config, services, instance, app, base) => {
  const {
    members,
    agendas
  } = services;

  app.use(base, expressUtils.https);

  app.get(`${base}.json`,
    expressUtils.https,
    agendas.mw.loadBy({
      path: 'params.agendaUid',
      field: 'uid'
    }),
    (req, res, next) => {
      if (!req.agenda.private) {
        next();
      } else {
        members.mw.loadOrFail(req, res, next);
      }
    },
    gaTrack('locations', 'export', 'json'),
    (req, res, next) => {
      instance(req.params.agendaUid).list(
        req.query,
        _.pick(req.query, ['offset', 'limit']),
        { total: true, detailed: true }
      ).then(({ items, total }) => res.json({
        total,
        offset: req.query.offset || 0,
        limit: req.query.limit || 20,
        items
      }), next);
    },
    (err, req, res) => {
      res.status(500).json();
      log('error', err);
    }
  );

  app.use((err, req, res, next) => {
    res.status(500).json();
    log('error', err);
  });
}
