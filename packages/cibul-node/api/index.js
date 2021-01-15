'use strict';

const VError = require('verror');
const express = require('express');

const logRequests = require('../services/logRequests');
const log = require('@openagenda/logs')('api');
const mw = require('./middleware');
const ih = require('immutability-helper');

const settings = {
  get: require('./endpoints/settingsGet'),
  resync: require('./endpoints/settingsResync')
};

const handleError = require('../services/errors').bind(null, 'api');

module.exports = core => {
  log('init');
  const app = express();

  app.core = core;
  app.services = core.services;

  const { upload } = app.services.events;
  const {
    verifySuperAdmin
  } = app.services.users.mw;

  log('middleware');
  app.use(logRequests.middleware);

  const postMw = [
    app.services.events.middleware.imageTransformAndUpload([{
      name: 'image',
      unique: true
    }]),
    mw.parseBodyData
  ];

  // should only apply to create and upload really
  app.post(/^\/v2.+/, postMw);
  app.patch(/^\/v2.+/, postMw);

  app.post('/v2/requestAccessToken', mw.requestAccessToken);

  // access token control and user load
  app.post(/^\/v2.+/, mw.verifyAndLoadAccessTokenUser);
  app.patch(/^\/v2.+/, mw.verifyAndLoadAccessTokenUser);
  app.delete(/^\/v2.+/, mw.verifyAndLoadAccessTokenUser);

  app.get(/^\/v2.+/, mw.verifyAndLoadKeyUser);

  // load all the things
  app.param('agendaUid', mw.loadAgenda);
  app.param('eventUid', mw.loadEvent);

  // control all the things
  app.post('/v2/agendas/:agendaUid/events*', mw.member.verify);
  app.patch('/v2/agendas/:agendaUid/events*', mw.member.verify);
  app.get('/v2/agendas/:agendaUid.prv', mw.member.verify);
  app.get('/v2/agendas/:agendaUid', mw.member.load);

  app.post('/v2/agendas/:agendaUid/events/:eventUid',  mw.verifyEventEditionRights);
  app.patch('/v2/agendas/:agendaUid/events/:eventUid',  mw.verifyEventEditionRights);
  app.delete('/v2/agendas/:agendaUid/events/:eventUid',  mw.verifyEventEditionRights);

  app.get('/v2/agendas/:agendaUid', mw.redirectIfPrivate);
  app.get([
    '/v2/agendas/:agendaUid',
    '/v2/agendas/:agendaUid.prv'
  ], async (req, res, next) => res.json(await core.agendas(req.agenda.uid).get({
    access: req.access
  })));

  app.post('/v2/agendas/:agendaUid/events', (req, res, next) => req.app.core
    .agendas(req.agenda.uid).events
    .create(req.parsedData, {
      context: {
        userUid: req.member.userUid
      },
      access: req.access,
      defaultLang: req.headers.lang
    }).then(event => res.json({
      success: true,
      event
    }), next)
  );

  // update the thing
  app.post('/v2/agendas/:agendaUid/events/:eventUid', mw.eventUpdate);
  app.patch('/v2/agendas/:agendaUid/events/:eventUid', mw.eventUpdate);

  // remove the thing
  app.delete('/v2/agendas/:agendaUid/events/:eventUid', (req, res, next) => req.app.core
    .agendas(req.agenda.uid).events
    .remove(req.event.uid, {
      context: {
        agendaUid: req.agenda.uid,
        userUid: req.user.uid
      }
    }).then(event => res.json({ success: true, event }), next)
  );

  app.get('/v2/agendas/:agendaUid/settings', [
    mw.member.allow(['administrator']),
    settings.get
  ]);

  app.get('/v2/agendas/:agendaUid/members', [
    mw.member.allow(['administrator']),
    (req, res, next) => req.app.core
      .agendas(req.agenda.uid).members.list(req.query)
      .then(data => res.json({
        ...data,
        success: true
      }), next)
  ]);

  app.post('/v2/agendas/:agendaUid/locations', [
    mw.member.allow(['administrator', 'moderator']),
    (req, res, next) => req.app.core
      .agendas(req.agenda.uid).locations
      .create(req.parsedData)
      .then(location => res.json({
        success: true,
        location
      }), next)
  ]);

  app.param('locationExtId', (req, res, next) => {
    req.locationIdentifier = {
      extId: req.params.locationExtId
    };
    next();
  });

  app.param('locationUid', (req, res, next) => {
    req.locationIdentifier = {
      uid: req.params.locationUid
    };
    next();
  });

  app.get([
    '/v2/agendas/:agendaUid/locations/:locationUid',
    '/v2/agendas/:agendaUid/locations/ext/:locationExtId'
  ], [
    mw.member.allow(['administrator', 'moderator']),
    (req, res, next) => req.app.core
      .agendas(req.agenda.uid).locations
      .get(req.locationIdentifier, {
        access: req.access,
        throwOnNotFound: req.method === 'HEAD',
        includeFields: req.method === 'HEAD' ? ['uid'] : []
      })
      .then(location => req.method === 'HEAD' ? res.send() : res.json({
        success: true,
        location
      }), next)
  ]);

  app.post([
    '/v2/agendas/:agendaUid/locations/:locationUid',
    '/v2/agendas/:agendaUid/locations/ext/:locationExtId'
  ], [
    mw.member.allow(['administrator', 'moderator']),
    (req, res, next) => req.app.core
      .agendas(req.agenda.uid).locations
      .update(req.locationIdentifier, req.parsedData)
      .then(location => res.json({
        success: true,
        location
      }), next)
  ]);

  app.patch([
    '/v2/agendas/:agendaUid/locations/:locationUid',
    '/v2/agendas/:agendaUid/locations/ext/:locationExtId'
  ], [
    mw.member.allow(['administrator', 'moderator']),
    (req, res, next) => req.app.core
      .agendas(req.agenda.uid).locations
      .patch(req.locationIdentifier, req.parsedData)
      .then(location => res.json({
        success: true,
        location
      }), next)
  ]);

  app.delete([
    '/v2/agendas/:agendaUid/locations/:locationUid',
    '/v2/agendas/:agendaUid/locations/ext/:locationExtId'
  ], [
    mw.member.allow(['administrator', 'moderator']),
    (req, res, next) => req.app.core
      .agendas(req.agenda.uid).locations
      .remove(req.locationIdentifier)
      .then(location => res.json({
        success: true,
        location
      }), next)
  ]);

  app.post('/v2/agendas/:agendaUid/settings/resync', [
    verifySuperAdmin,
    settings.resync
  ]);

  app.get('/v2/me/agendas', (req, res, next) => {
    core.users(req.user).agendas.list(req.query)
      .then(data => res.json({...data, success: true }), next);
  });

  app.use((err, req, res, next) => {
    if ([
      'BadRequestError',
      'NotFoundError',
      'ValidationError'
    ].includes(err.name)) {
      return res.status(err.statusCode).json({
        errors: err.detail
      });
    }

    handleError(new VError({
      cause: err,
      info: {
        body: req.body,
        query: req.query
      }
    }), req);

    return res.status(500).json({
      message: 'server trouble.. send an short mail to support to receive detailed feedback: support@openagenda.com'
    });
  });

  log('done');

  return app;
}
