'use strict';

const VError = require('verror');
const express = require('express');
const multer = require('multer');

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
  const config = core.getConfig();

  app.core = core;
  app.services = core.loadServices();

  const upload = multer({
    dest: config.tmpFolderPath
  });

  log('middleware');
  app.use(logRequests.middleware);

  // should only apply to create and upload really
  app.post(/^\/v2.+/, upload.single('image'));
  app.patch(/^\/v2.+/, upload.single('image'));

  app.post(/^\/v2.+/, mw.parseBodyData);
  app.patch(/^\/v2.+/, mw.parseBodyData);

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
  app.post('/v2/agendas/:agendaUid/events*', mw.verifyMember);
  app.patch('/v2/agendas/:agendaUid/events*', mw.verifyMember);

  app.post('/v2/agendas/:agendaUid/events/:eventUid',  mw.verifyEventEditionRights);
  app.patch('/v2/agendas/:agendaUid/events/:eventUid',  mw.verifyEventEditionRights);
  app.delete('/v2/agendas/:agendaUid/events/:eventUid',  mw.verifyEventEditionRights);

  // create the thing
  app.post('/v2/agendas/:agendaUid/events', events.create);

  // update the thing
  app.post('/v2/agendas/:agendaUid/events/:eventUid', events.update);
  app.patch('/v2/agendas/:agendaUid/events/:eventUid', events.update);

  // remove the thing
  app.delete('/v2/agendas/:agendaUid/events/:eventUid', events.remove);

  app.get('/v2/agendas/:agendaUid/settings', [
    mw.verifyMember.allow(['administrator']),
    settings.get
  ]);

  app.post('/v2/agendas/:agendaUid/settings/resync', [
    mw.verifySuperAdmin,
    settings.resync
  ]);


  app.use((err, req, res, next) => {
    handleError(new VError({
      cause: err,
      info: {
        url: req.originalUrl,
        body: req.body,
        query: req.query
      }
    }));

    return res.status(500).json({
      message: 'server trouble.. send an short mail to support to receive detailed feedback: support@openagenda.com'
    });
  });

  log('done');

  return app;
}
