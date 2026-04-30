import express from 'express';
import bodyParser from 'body-parser';
import Core from '../../core/index.js';
import localFront from '../../auth/local.front.js';
import generalFront from '../../general/front.js';

// Mounts a base Express app for integration tests: trust proxy, view engine,
// services + core attached, the /api/auth/* better-auth handler before the
// body parsers, sessions middleware (with detailed load), and a generic
// json-error handler. The optional `extend` callback runs after the auth/general
// fronts are mounted but before the error handler, so callers can register
// extra routes (e.g. /whoami, /protected) without duplicating the boilerplate.
export default function buildApp(services, config, { extend } = {}) {
  const app = express();
  app.set('trust proxy', ['loopback', 'uniquelocal']);
  app.set('view engine', 'ejs');
  app.services = services;
  app.core = Core(services, config);

  app.all('/api/auth/*', services.auth.nodeHandler);
  app.use(
    bodyParser.json({ limit: '5mb' }),
    bodyParser.urlencoded({ limit: '500kb', extended: true }),
    (req, res, next) => {
      res.locals = res.locals || {};
      res.locals.cspNonce = 'test';
      next();
    },
    services.sessions.mw,
    services.sessions.mw.load({ detailed: true }),
    (req, _res, next) => {
      req.lang = req.query.lang || 'fr';
      req.log = {
        info: () => {},
        warn: () => {},
        error: () => {},
        debug: () => {},
        load: () => {},
      };
      req.genUrl = services.genUrl.copy();
      next();
    },
  );

  localFront(app);
  generalFront(app);

  if (typeof extend === 'function') extend(app);

  app.use((err, req, res, _next) => {
    res.status(500).json({ error: err.message });
  });
  return app;
}
