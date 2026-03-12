import { Forbidden } from '@openagenda/verror';
import feathers from '@feathersjs/feathers';
import express from '@feathersjs/express';
import cmn from '../../lib/commons-app.js';
import changeEmailMw from './middleware/changeEmail.js';
import setFlashAccountRemoved from './middleware/setFlashAccountRemoved.js';
import getHandler from './lib/getHandler.js';

export default function plugApp(app) {
  const service = app.services.users;

  const { sessions } = app.services;

  express(feathers(), app); // extend app with .configure, .service and .use
  app.configure(express.rest(null)); // add handler for requests

  app.use('/users', (req, res, next) => {
    const isAuthenticated = !!req.user;
    req.feathers.user = req.user;
    req.authenticated = isAuthenticated;
    req.feathers.authenticated = isAuthenticated;

    next();
  });

  app.use('/users/:__feathersId', (req, res, next) => {
    if (
      req.params.__feathersId !== 'me'
      && parseInt(req.params.__feathersId, 10) !== req.user?.uid
    ) {
      return next(new Forbidden('Not authorized'));
    }

    next();
  });

  app.use(
    '/users/me',
    service.upload.middleware([{ name: 'image', unique: true }]),
  );

  app.get('/users', getHandler('find', ['params'])(service));
  app.get('/users/:__feathersId', getHandler('get', ['id', 'params'])(service));
  app.post('/users', getHandler('create', ['data', 'params'])(service));
  app.patch(
    '/users/:__feathersId',
    getHandler('patch', ['id', 'data', 'params'])(service),
  );
  app.patch('/users', getHandler('patch', ['id', 'data', 'params'])(service));
  app.put(
    '/users/:__feathersId',
    getHandler('update', ['id', 'data', 'params'])(service),
  );
  app.put('/users', getHandler('update', ['id', 'data', 'params'])(service));
  app.delete(
    '/users/:__feathersId',
    getHandler('remove', ['id', 'params'])(service),
  );
  app.delete('/users', getHandler('remove', ['id', 'params'])(service));

  app.patch(
    '/users/:__feathersId/requestChangeEmail',
    getHandler('requestChangeEmail', ['id', 'data', 'params'])(service),
  );
  app.get(
    '/users/:__feathersId/confirmChangeEmail',
    getHandler('confirmChangeEmail', ['id', 'params'])(service),
  );
  app.patch(
    '/users/:__feathersId/changePassword',
    getHandler('changePassword', ['id', 'data', 'params'])(service),
  );
  app.get(
    '/users/:__feathersId/generateApiKey',
    getHandler('generateApiKey', ['id', 'params'])(service),
  );
  app.patch(
    '/users/:__feathersId/setNewFlag',
    getHandler('setNewFlag', ['id', 'data', 'params'])(service),
  );
  app.patch(
    '/users/:__feathersId/refresh',
    getHandler('refresh', ['id', 'data', 'params'])(service),
  );

  // update session after a user patch
  app.patch(
    '/users/:__feathersId',
    sessions.mw.open('user', 'sessionResult'),
    (req, res, next) => {
      if (!res.data) {
        return next();
      }

      sessions.mw.sync('syncResult')(req, res, next);
    },
  );

  // send confirmation email after requestChangeEmail
  app.patch('/users/:__feathersId/requestChangeEmail', changeEmailMw.send);

  app.get('/users/:__feathersId/confirmChangeEmail', changeEmailMw.onSuccess);

  // set flash & redirect message after account deletion
  app.delete('/users/:__feathersId', setFlashAccountRemoved());

  app.use('/users', (error, req, res, _next) => {
    const statusCode = error.statusCode
      || (!Number.isNaN(parseInt(error.code, 10))
        ? parseInt(error.code, 10)
        : 500);

    res.status(statusCode);

    const contentType = req.headers['content-type'] || '';
    const accepts = req.headers.accept || '';

    const jsonFormatter = () => {
      const output = {
        name: error.name,
        message: error.message,
        code: statusCode,
        ...error.info?.errors ? { errors: error.info.errors } : {},
      };

      if (process.env.NODE_ENV !== 'production') {
        output.stack = error.stack;
      }

      res.set('Content-Type', 'application/json');
      res.json(output);
    };

    // by default just send back json
    if (contentType.indexOf('json') !== -1 || accepts.indexOf('json') !== -1) {
      jsonFormatter();
    } else if (
      contentType.indexOf('html') !== -1
      || accepts.indexOf('html') !== -1
    ) {
      if (req.originalUrl.includes('confirmChangeEmail')) {
        changeEmailMw.onError(error, req, res);
        return;
      }
      cmn.catchError(req, res)(error);
    } else {
      jsonFormatter();
    }
  });
}
