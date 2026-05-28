import { Forbidden, NotFound, BadRequest } from '@openagenda/verror';
import feathers from '@feathersjs/feathers';
import express from '@feathersjs/express';
import cmn from '../../lib/commons-app.js';
import { requireUserJson } from '../../lib/authGuards.js';
import changeEmailMw from './middleware/changeEmail.js';
import unlinkFacebookMw from './middleware/unlinkFacebook.js';
import setFlashAccountRemoved from './middleware/setFlashAccountRemoved.js';
import getHandler from './lib/getHandler.js';

export default function plugApp(app) {
  const service = app.services.users;

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
    '/users/:__feathersId/requestUnlinkFacebook',
    unlinkFacebookMw.validatePassword,
    getHandler('requestUnlinkFacebook', ['id', 'data', 'params'])(service),
  );
  app.get(
    '/users/:__feathersId/generateApiKey',
    getHandler('generateApiKey', ['id', 'params'])(service),
  );

  // D3b-user — user API key management on the better-auth `apikey` store, via
  // the @openagenda/auth façade (referenceId = the user's uid). Mounted under
  // `/users/me`, so the owner is always the authenticated user — a user only
  // manages their own keys, there is no addressable user id. JSON/XHR, so
  // requireUserJson (401) rather than requireUser (302). No dual-write-back to
  // `api_key_set`: native keys live only in `apikey`. `oaKind` is the tier and
  // is required on create (no default: `sk` = read+write vs `pk` =
  // read-only/public-locked is a deliberate, security-relevant choice — see
  // §5.2). New paths, parallel to the legacy single-pair `generateApiKey`
  // above, which stays live until the UI is switched (D3c).
  app.get('/users/me/api-keys', requireUserJson, async (req, res, next) => {
    try {
      const items = await req.app.services.auth.listUserKeys(req.user.uid);
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  // Creates one key; the plaintext is returned ONCE under `key` (the stored
  // record never carries it).
  app.post('/users/me/api-keys', requireUserJson, async (req, res, next) => {
    const { oaKind, name } = req.body ?? {};
    if (oaKind !== 'pk' && oaKind !== 'sk') {
      return next(
        new BadRequest('oaKind is required and must be "pk" or "sk"'),
      );
    }
    try {
      const { key, record } = await req.app.services.auth.createUserKey(
        req.user.uid,
        { oaKind, name },
      );
      res.status(201).json({ key, record });
    } catch (err) {
      next(err);
    }
  });

  // Owner-scoped revoke: the façade matches both id AND referenceId, so a user
  // cannot delete another user's key by id. A miss is a 404.
  app.delete(
    '/users/me/api-keys/:keyId',
    requireUserJson,
    async (req, res, next) => {
      try {
        const removed = await req.app.services.auth.revokeUserKey(
          req.user.uid,
          req.params.keyId,
        );
        if (!removed) {
          return next(new NotFound('api key not found'));
        }
        res.json({ removed: true });
      } catch (err) {
        next(err);
      }
    },
  );

  // Rename one key (its `name` label), owner-scoped like revoke. 404 on a miss.
  app.patch(
    '/users/me/api-keys/:keyId',
    requireUserJson,
    async (req, res, next) => {
      const { name } = req.body ?? {};
      if (typeof name !== 'string') {
        return next(new BadRequest('name is required and must be a string'));
      }
      try {
        const record = await req.app.services.auth.renameUserKey(
          req.user.uid,
          req.params.keyId,
          name,
        );
        if (!record) {
          return next(new NotFound('api key not found'));
        }
        res.json({ record });
      } catch (err) {
        next(err);
      }
    },
  );
  app.patch(
    '/users/:__feathersId/setNewFlag',
    getHandler('setNewFlag', ['id', 'data', 'params'])(service),
  );
  app.patch(
    '/users/:__feathersId/refresh',
    getHandler('refresh', ['id', 'data', 'params'])(service),
  );

  // The patch's afterPatchRefreshSession hook already re-snapshotted the user
  // into the Redis session; rebuild the signed cookie cache from that fresh
  // snapshot and forward it so the client sees the updated fullName / image /
  // culture immediately instead of waiting for cookieCache.maxAge expiry.
  app.patch('/users/:__feathersId', async (req, res, next) => {
    if (!res.data) return next();
    const { auth } = req.app.services;
    if (!auth) return next();
    try {
      const out = await auth.api.getSession({
        headers: auth.toHeaders(req),
        query: { disableCookieCache: true },
        asResponse: true,
      });
      auth.forwardSetCookieHeaders(out, res);
    } catch (_err) {
      // Cache stays stale until natural expiry; not worth failing the patch.
    }
    next();
  });

  // send confirmation email after requestChangeEmail
  app.patch('/users/:__feathersId/requestChangeEmail', changeEmailMw.send);

  app.get('/users/:__feathersId/confirmChangeEmail', changeEmailMw.onSuccess);

  // send activation email after requestUnlinkFacebook
  app.patch(
    '/users/:__feathersId/requestUnlinkFacebook',
    unlinkFacebookMw.send,
  );

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
