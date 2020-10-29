'use strict';

const _ = require('lodash');
const expressUtils = require('@openagenda/utils/express');
const gaTrack = require('../../lib/gaTrack.mw');
const loadLocationEndpoints = require('./lib/loadLocationEndpoints');
const log = require('@openagenda/logs')('locations/plugAgendaApp');

module.exports = (config, services, service, app, base) => {
  const {
    members,
    agendas,
    agendaContribute
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
    loadLocationEndpoints(service),
    (req, res, next) => {
      req.locations.list(
        req.query,
        _.pick(req.query, ['offset', 'limit']),
        { total: true, detailed: !req.query.sample, includeImagePath: true }
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

  app.post(`${base}`,
    members.mw.load,
    agendaContribute.mw.verifyMemberAuthorization,
    service.imageTransformAndUpload.middleware([{
      name: 'image',
      unique: true
    }]),
    (req, res, next) => {
      req.locations.create({
        ...req.body,
        state: 0
      }, {
        includeImagePath: true
      }).then(location => {
        res.json({
          location,
          success: true
        });
      }, next);
    }
  );

  app.use(base, (err, req, res, next) => {
    if (err.name === 'ValidationError') {
      res.status(400).json({
        errors: err.detail,
        success: false
      });
    } else {
      res.status(500).json();
      log('error', err);
    }
  });
}
