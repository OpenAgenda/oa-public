'use strict';

const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');

const cmn = require('../../lib/commons-app');
const resyncSession = require('./middleware/resyncSession');
const sendChangeEmail = require('./middleware/sendChangeEmail');
const setFlashChangeEmail = require('./middleware/setFlashChangeEmail');
const setFlashAccountRemoved = require('./middleware/setFlashAccountRemoved');
const getHandler = require('./lib/getHandler');

module.exports = function plugApp(app) {
  const service = app.services.users;

  const {
    sessions,
  } = app.services;

  express(feathers(), app); // extend app with .configure, .service and .use
  app.configure(express.rest(null)); // add handler for requests

  app.use(
    '/users',
    (req, res, next) => {
      const isAuthenticated = !!req.user;
      req.feathers.user = req.user;
      req.authenticated = isAuthenticated;
      req.feathers.authenticated = isAuthenticated;

      next();
    },
  );

  app.use('/users/me', service.upload.middleware([{ name: 'image', unique: true }]));

  app.get('/users', getHandler('find', ['params'])(service));
  app.get('/users/:__feathersId', getHandler('get', ['id', 'params'])(service));
  app.post('/users', getHandler('create', ['data', 'params'])(service));
  app.patch('/users/:__feathersId', getHandler('patch', ['id', 'data', 'params'])(service));
  app.patch('/users', getHandler('patch', ['id', 'data', 'params'])(service));
  app.put('/users/:__feathersId', getHandler('update', ['id', 'data', 'params'])(service));
  app.put('/users', getHandler('update', ['id', 'data', 'params'])(service));
  app.delete('/users/:__feathersId', getHandler('remove', ['id', 'params'])(service));
  app.delete('/users', getHandler('remove', ['id', 'params'])(service));

  app.patch(
    '/users/:__feathersId/requestChangeEmail',
    getHandler('requestChangeEmail', ['id', 'data', 'params'])(service),
  );
  app.get('/users/:__feathersId/confirmChangeEmail', getHandler('confirmChangeEmail', ['id', 'params'])(service));
  app.patch('/users/:__feathersId/changePassword', getHandler('changePassword', ['id', 'data', 'params'])(service));
  app.get('/users/:__feathersId/generateApiKey', getHandler('generateApiKey', ['id', 'params'])(service));
  app.patch('/users/:__feathersId/setNewFlag', getHandler('setNewFlag', ['id', 'data', 'params'])(service));
  app.patch('/users/:__feathersId/refresh', getHandler('refresh', ['id', 'data', 'params'])(service));

  // update session after a user patch
  app.patch(
    '/users/:__feathersId',
    sessions.mw.open('user', 'sessionResult'),
    resyncSession(),
  );

  // send confirmation email after requestChangeEmail
  app.patch(
    '/users/:__feathersId/requestChangeEmail',
    sendChangeEmail(service),
  );

  // set flash message after confirm change of email
  app.get(
    '/users/:__feathersId/confirmChangeEmail',
    setFlashChangeEmail(),
  );

  // set flash & redirect message after account deletion
  app.delete(
    '/users/:__feathersId',
    setFlashAccountRemoved(),
  );

  app.use('/users', express.errorHandler({
    html: (err, req, res) => cmn.catchError(req, res)(err),
    logger: null,
  }));
};
