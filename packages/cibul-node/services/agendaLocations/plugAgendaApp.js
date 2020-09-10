'use strict';

const _ = require('lodash');
const expressUtils = require('@openagenda/utils/express');
const gaTrack = require('../../lib/gaTrack.mw');
const log = require('@openagenda/logs')('locations/plugAgendaApp');

const {
  loadLocation,
  setImageOnExistingLocation,
  setImageOnNewLocation
} = require('./lib/middleware');

module.exports = (config, services, service, app, base) => {
  const {
    members,
    agendas
  } = services;

  app.use(`${base}*`,
    expressUtils.https,
    agendas.mw.loadBy({
      path: 'params.agendaUid',
      field: 'uid'
    })
  );

  app.get(`${base}.json`,
    (req, res, next) => {
      if (!req.agenda.private) {
        next();
      } else {
        members.mw.loadOrFail(req, res, next);
      }
    },
    gaTrack('locations', 'export', 'json'),
    (req, res, next) => {
      service(req.params.agendaUid).list(
        req.query,
        _.pick(req.query, ['offset', 'limit']),
        { total: true, detailed: true, includeImagePath: true }
      ).then(({ items, total }) => res.json({
        total,
        offset: parseInt(req.query.offset || 0),
        limit: parseInt(req.query.limit || 20),
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
