'use strict';

const VError = require('verror');
const express = require('express');

const logRequests = require('../services/logRequests');
const log = require('@openagenda/logs')('api');
const mw = require('./middleware');

const events = {
  create: require('./endpoints/eventCreate'),
  update: require('./endpoints/eventUpdate'),
  remove: require('./endpoints/eventRemove')
};

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

  // const upload = multer({
  //   dest: core.getConfig().tmpFolderPath
  // });

  const { upload } = app.services.events;

  log('middleware');
  app.use(logRequests.middleware);

  const postMw = [
    upload.middleware([{ name: 'image', unique: true }]),
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

  // create the thing
  app.post('/v2/agendas/:agendaUid/events', events.create);

  // update the thing
  app.post('/v2/agendas/:agendaUid/events/:eventUid', events.update);
  app.patch('/v2/agendas/:agendaUid/events/:eventUid', events.update);

  // remove the thing
  app.delete('/v2/agendas/:agendaUid/events/:eventUid', events.remove);

  app.get('/v2/agendas/:agendaUid/settings', [
    mw.member.allow(['administrator']),
    settings.get
  ]);

  app.get('/v2/agendas/:agendaUid/members', [
    mw.member.allow(['administrator']),
    (req, res, next) => req.app.core
      .agendas(req.agenda.uid).members.list(req.query)
      .then(data => res.json({...data, success: true }), next)
  ]);

  app.post('/v2/agendas/:agendaUid/settings/resync', [
    mw.verifySuperAdmin,
    settings.resync
  ]);

  app.get('/v2/me/agendas', (req, res, next) => {
    core.users(req.user).agendas.list(req.query)
      .then(data => res.json({...data, success: true }), next);
  });


  app.use((err, req, res, next) => {
    handleError(new VError({
      cause: err,
      info: {
        body: req.body,
        query: req.query
      }
    }), req);

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        errors: err.detail
      });
    }

    return res.status(500).json({
      message: 'server trouble.. send an short mail to support to receive detailed feedback: support@openagenda.com'
    });
  });

  log('done');

  return app;
}
