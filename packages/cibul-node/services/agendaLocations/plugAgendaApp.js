'use strict';

const _ = require('lodash');
const expressUtils = require('@openagenda/utils/express');
const log = require('@openagenda/logs')('locations/plugAgendaApp');
const gaTrack = require('../../lib/gaTrack');
const loadLocationEndpoints = require('./lib/loadLocationEndpoints');

module.exports = (services, service, app, base) => {
  const {
    members,
    agendas,
    agendaContribute,
  } = services;

  app.use(
    `${base}*`,
    expressUtils.https,
    agendas.mw.loadBy({
      path: 'params.agendaUid',
      field: 'uid',
    }),
  );

  app.get(
    `${base}.json`,
    (req, res, next) => {
      if (!req.agenda.private) {
        next();
      } else {
        members.mw.loadOrFail(req, res, next);
      }
    },
    gaTrack.mw('locations', 'export', 'json'),
    loadLocationEndpoints(service),
    (req, res, next) => {
      req.locations.list(
        req.query,
        _.pick(req.query, ['offset', 'limit']),
        { total: true, detailed: !req.query.sample, includeImagePath: true },
      ).then(({ items, total }) => res.json({
        total,
        offset: parseInt(req.query.offset ?? 0, 10),
        limit: parseInt(req.query.limit ?? 20, 10),
        items,
      }), next);
    },
    (err, req, res) => {
      res.status(500).json();
      log('error', err);
    },
  );

  app.post(
    `${base}`,
    members.mw.load,
    agendaContribute.mw.verifyMemberAuthorization,
    loadLocationEndpoints(service),
    service.imageTransformAndUpload.middleware([{
      name: 'image',
      unique: true,
    }]),
    (req, res, next) => {
      req.locations.create({
        ...req.body,
        state: 0,
      }, {
        includeImagePath: true,
        agendaUid: req.agenda.uid,
      }).then(location => {
        res.json({
          location,
          success: true,
        });
      }, next);
    },
  );

  app.use(base, (err, req, res, _next) => {
    if (err.name === 'BadRequest') {
      res.status(400).json({
        errors: err.info,
        success: false,
      });
    } else {
      res.status(500).json();
      log('error', err);
    }
  });
};
