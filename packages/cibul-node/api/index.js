'use strict';

const _ = require('lodash');
const VError = require('verror');
const express = require('express');
const log = require('@openagenda/logs')('api');

const logRequests = require('../services/logRequests');
const errors = require('../services/errors');

const mw = require('./middleware');
const getSettingsEndpoint = require('./endpoints/settingsGet');
const getSettingsResyncEndpoint = require('./endpoints/settingsResync');

const settings = {
  get: getSettingsEndpoint,
  resync: getSettingsResyncEndpoint
};

const handleError = errors.bind(null, 'api');

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
  app.param('agendaSlug', mw.loadAgenda);

  // control all the things
  app.post('/agendas/:agendaUid/events*', mw.member.verify);
  app.patch('/agendas/:agendaUid/events*', mw.member.verify);
  app.get('/agendas/:agendaUid.prv', mw.member.verify);
  app.get('/agendas/:agendaUid', mw.member.load);

  app.get([
    '/agendas/slug/:agendaSlug',
    '/agendas/:agendaUid'
  ], mw.redirectIfPrivate);

  app.get([
    '/agendas/slug/:agendaSlug',
    '/agendas/:agendaUid',
    '/agendas/:agendaUid.prv'
  ], async (req, res, next) => res.json(await core.agendas(req.agenda.uid).get({
    access: req.access,
    includeEvent: true,
    detailed: req.query.detailed,
    includeNonDataFields: req.query.includeNonDataFields === '1'
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
      }), next));

  app.post('/agendas/:agendaUid/events/:eventUid', mw.eventUpdate);

  app.patch('/agendas/:agendaUid/events/:eventUid', mw.eventUpdate);

  app.delete('/agendas/:agendaUid/events/:eventUid', (req, res, next) => core
    .agendas(req.agenda.uid).events
    .remove(req.event.uid, {
      context: {
        agendaUid: req.agenda.uid,
        userUid: req.user.uid
      }
    }).then(event => res.json({ success: true, event }), next));

  app.get('/agendas/:agendaUid/events', mw.convertLegacyFilter, (req, res, next) => core
    .agendas(req.agenda.uid).events
    .search(req.convertedQuery, req.convertedQuery, {
      ...req.convertedQuery,
      useAfterKey: true,
      userUid: req.user?.uid
    }).then(result => res.json({
      success: true,
      ...result
    }), next));

  app.get([
    '/agendas/:agendaUid/events/:eventUid',
    '/agendas/:agendaUid/events/slug/:eventSlug'
  ], [
    mw.getEventFromSearchOrAsDraft,
    mw.evaluateUserAccessToEvent,
    (req, res) => res.json({
      success: true,
      event: req.event
    })
  ]);

  app.get('/agendas/:agendaUid/settings', [
    mw.member.allow(['administrator']),
    settings.get
  ]);

  app.get('/agendas/:agendaUid/members', [
    mw.member.allow(['administrator', 'moderator']),
    (req, res, next) => core
      .agendas(req.agenda.uid).members.list(req.query, {
        userUid: req.user.uid
      })
      .then(data => res.json({
        ...data,
        success: true
      }), next)
  ]);

  app.post(
    '/agendas/:agendaUid/members',
    (req, res, next) => core
      .agendas(req.agenda.uid).members
      .create(req.body.userUid ?? req.user.uid, req.body.role, req.parsedData, { userUid: req.user.uid })
      .then(member => res.json(member), next)
  );

  app.get('/agendas/:agendaUid/members/:userUid', [
    mw.member.load,
    (req, res, next) => core
      .agendas(req.agenda.uid).members
      .get(req.params.userUid, {
        userUid: req.user.uid
      })
      .then(member => res.json(member), next)
  ]);

  app.patch('/agendas/:agendaUid/members/:userUid', [
    mw.member.load,
    (req, res, next) => core
      .agendas(req.agenda.uid)
      .members.patch(req.params.userUid, req.parsedData, { userUid: req.user.uid })
      .then(member => res.json(member), next)
  ]);

  app.delete('/agendas/:agendaUid/members/:userUid', [
    mw.member.load,
    (req, res, next) => core
      .agendas(req.agenda.uid).members
      .remove(req.params.userUid, {
        userUid: req.user.uid
      }).then(() => res.json({
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
      .then(location => (req.method === 'HEAD' ? res.send() : res.json({
        success: true,
        location
      })), next)
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
      .list(req.query, req.query, {
        useAfter: !req.query.from || !!req.query.after,
        eventCounts: !!req.query.eventCounts,
        itemsKey: req.query.itemsKey ?? 'locations'
      })
      .then(({ items, total, after }) => res.json({
        success: true,
        after,
        total,
        [req.query.itemsKey ?? 'locations']: items
      }), next)
  );

  app.get(
    '/agendas/:agendaUid/embeds/:embedUid',
    (req, res, next) => core
      .agendas(req.agenda.uid)
      .embeds(req.params.embedUid)
      .get().then(embed => res.json(embed), next)
  );

  app.post(
    '/agendas/:agendaUid/embeds/:embedUid',
    mw.member.allow(['administrator']),
    (req, res, next) => core
      .agendas(req.agenda.uid)
      .embeds(req.params.embedUid)
      .update(req.parsedData)
      .then(embed => res.json(embed), next)
  );

  app.get(
    '/agendas/:agendaUid/embeds',
    mw.member.allow(['administrator']),
    (req, res, next) => core
      .agendas(req.agenda.uid)
      .embeds.list()
      .then(embeds => res.json(embeds), next)
  );

  app.post(
    '/agendas/:agendaUid/embeds',
    mw.member.allow(['administrator']),
    (req, res, next) => core
      .agendas(req.agenda.uid)
      .embeds.create(req.parsedData)
      .then(embed => res.json(embed), next)
  );

  app.post('/agendas/:agendaUid/settings/resync', [
    verifySuperAdmin,
    settings.resync
  ]);

  app.get('/me', (req, res, next) => core.users
    .get(req.user.uid, { detailed: true })
    .then(user => res.json(_.pick(user, ['apiKey'])), next));

  app.get('/me/agendas', (req, res, next) => {
    core.users(req.user).agendas.list(req.query)
      .then(data => res.json({ ...data, success: true }), next);
  });

  app.get('/me/agendas/:agendaUid', [
    mw.member.load,
    (req, res, next) => core
      .users(req.user.uid)
      .agendas(req.params.agendaUid)
      .getContext({ userUid: req.user.uid })
      .then(context => res.json(context), next)
  ]);

  app.get('/me/agendas/:agendaUid/events/:eventUid', [
    mw.member.load,
    (req, res, next) => core
      .users(req.user.uid)
      .agendas(req.params.agendaUid)
      .events(req.params.eventUid)
      .getContext({ userUid: req.user.uid })
      .then(context => res.json(context), next)
  ]);

  app.get('/agendas', (req, res, next) => {
    core.agendas.search(req.query, req.query, {
      includeFields: req.query.fields ? [].concat(req.query.fields) : null
    }).then(data => res.json({ ...data, success: true }), next);
  });

  app.use((err, req, res, _next) => {
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

    if (err.name === 'BadRequest') {
      return res.status(err.code).json({
        message: err.message,
        errors: err.info.errors,
        info: _.omit(err.info, ['errors'])
      });
    }

    if ([
      'Forbidden',
      'NotFound'
    ].includes(err.name)) {
      return res.status(err.code).json({
        message: err.message,
        info: err.info
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
};
