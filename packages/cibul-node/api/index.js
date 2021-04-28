'use strict';

const VError = require('verror');
const express = require('express');

const logRequests = require('../services/logRequests');
const log = require('@openagenda/logs')('api');
const mw = require('./middleware');

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

  app.post('*', postMw);
  app.patch('*', postMw);

  app.post('/requestAccessToken', mw.requestAccessToken);

  // access token control and user load
  app.post('*', mw.verifyAndLoadAccessTokenUser);
  app.patch('*', mw.verifyAndLoadAccessTokenUser);
  app.delete('*', mw.verifyAndLoadAccessTokenUser);

  app.get('*', mw.verifyAndLoadKeyUser);

  // load all the things
  app.param('agendaUid', mw.loadAgenda);
  app.param('eventUid', mw.loadEvent);

  // control all the things
  app.post('/agendas/:agendaUid/events*', mw.member.verify);
  app.patch('/agendas/:agendaUid/events*', mw.member.verify);
  app.get('/agendas/:agendaUid.prv', mw.member.verify);
  app.get('/agendas/:agendaUid', mw.member.load);

  app.get('/agendas/:agendaUid', mw.redirectIfPrivate);
  app.get([
    '/agendas/:agendaUid',
    '/agendas/:agendaUid.prv'
  ], async (req, res, next) => res.json(await core.agendas(req.agenda.uid).get({
    access: req.access,
    includeEvent: true,
    detailed: req.query.detailed
  }).catch(next)));

  app.post('/agendas/:agendaUid/events', 
    mw.moveEventLegacyImageCredits,
    (req, res, next) => core
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

  app.post('/agendas/:agendaUid/events/:eventUid', mw.eventUpdate);

  app.patch('/agendas/:agendaUid/events/:eventUid', mw.eventUpdate);

  app.delete('/agendas/:agendaUid/events/:eventUid', (req, res, next) => core
    .agendas(req.agenda.uid).events
    .remove(req.event.uid, {
      context: {
        agendaUid: req.agenda.uid,
        userUid: req.user.uid
      }
    }).then(event => res.json({ success: true, event }), next)
  );

  app.get('/agendas/:agendaUid/events', (req, res, next) => core
    .agendas(req.agenda.uid).events
    .search(req.query, req.query, {
      ...req.query,
      useAfterKey: true,
      userUid: req.user?.uid
    }).then(({
      events,
      sort,
      total,
      after
    }) => res.json({
      success: true,
      sort,
      total,
      after,
      events
    }), next)
  );

  app.get('/agendas/:agendaUid/settings', [
    mw.member.allow(['administrator']),
    settings.get
  ]);

  app.get('/agendas/:agendaUid/members', [
    mw.member.allow(['administrator']),
    (req, res, next) => core
      .agendas(req.agenda.uid).members.list(req.query)
      .then(data => res.json({
        ...data,
        success: true
      }), next)
  ]);

  app.post('/agendas/:agendaUid/locations', [
    mw.member.allow(['administrator', 'moderator']),
    (req, res, next) => core
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
    '/agendas/:agendaUid/locations/:locationUid',
    '/agendas/:agendaUid/locations/ext/:locationExtId'
  ], [
    mw.member.allow(['administrator', 'moderator']),
    (req, res, next) => core
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
    '/agendas/:agendaUid/locations/:locationUid',
    '/agendas/:agendaUid/locations/ext/:locationExtId'
  ], [
    mw.member.allow(['administrator', 'moderator']),
    (req, res, next) => core
      .agendas(req.agenda.uid).locations
      .update(req.locationIdentifier, req.parsedData)
      .then(location => res.json({
        success: true,
        location
      }), next)
  ]);

  app.patch([
    '/agendas/:agendaUid/locations/:locationUid',
    '/agendas/:agendaUid/locations/ext/:locationExtId'
  ], [
    mw.member.allow(['administrator', 'moderator']),
    (req, res, next) => core
      .agendas(req.agenda.uid).locations
      .patch(req.locationIdentifier, req.parsedData)
      .then(location => res.json({
        success: true,
        location
      }), next)
  ]);

  app.delete([
    '/agendas/:agendaUid/locations/:locationUid',
    '/agendas/:agendaUid/locations/ext/:locationExtId'
  ], [
    mw.member.allow(['administrator', 'moderator']),
    (req, res, next) => core
      .agendas(req.agenda.uid).locations
      .remove(req.locationIdentifier)
      .then(location => res.json({
        success: true,
        location
      }), next)
  ]);

  app.get(
    '/agendas/:agendaUid/locations',
    (req, res, next) => core
      .agendas(req.agenda.uid).locations
      .list(req.query, req.query)
      .then(({ items, total, after }) => res.json({
        success: true,
        locations: items,
        after,
        total
      }), next)
  )

  app.post('/agendas/:agendaUid/settings/resync', [
    verifySuperAdmin,
    settings.resync
  ]);

  app.get('/me/agendas', (req, res, next) => {
    core.users(req.user).agendas.list(req.query)
      .then(data => res.json({...data, success: true }), next);
  });

  app.get('/agendas', (req, res, next) => {
    core.agendas.search(req.query, req.query, {
      includeFields: req.query.fields ? [].concat(req.query.fields) : null
    }).then(data => res.json({...data, success: true}), next);
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

    if ([
      'UnauthorizedError'
    ].includes(err.name)) {
      return res.status(err.statusCode).json({
        message: err.message
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
