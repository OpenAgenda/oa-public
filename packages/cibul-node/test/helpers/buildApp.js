import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import Core from '../../core/index.js';

// Mounts a base Express app for integration tests: trust proxy, view engine,
// services + core attached, the /api/auth/* better-auth handler before the
// body parsers, the BA-aware sessions.mw.load (populates req.user), and a
// generic json-error handler. The optional `extend` callback registers route fronts
// (localFront, googleFront, facebookFront, generalFront, custom test routes,
// …). Each test mounts only what it needs — keeps `buildApp` small and
// avoids cross-test surprises (e.g. localFront's `/:agendaSlug/signin`
// catch-all hijacking `/google/signin` when google.front isn't mounted).
export default function buildApp(services, config, { extend } = {}) {
  const app = express();
  app.set('trust proxy', ['loopback', 'uniquelocal']);
  app.set('view engine', 'ejs');
  app.services = services;
  app.core = Core(services, config);

  // Deny public access to OA-internal BA plugin endpoints (oa-impersonation).
  // Must precede the catch-all `/api/auth/*` handler. Mirrors server.js.
  app.all('/api/auth/oa/*', (req, res) => res.sendStatus(404));
  app.all('/api/auth/*', services.auth.nodeHandler);
  app.use(
    bodyParser.json({ limit: '5mb' }),
    bodyParser.urlencoded({ limit: '500kb', extended: true }),
    cookieParser(),
    (req, res, next) => {
      res.locals = res.locals || {};
      res.locals.cspNonce = 'test';
      next();
    },
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

  if (typeof extend === 'function') extend(app);

  app.use((err, req, res, _next) => {
    res.status(500).json({ error: err.message });
  });
  return app;
}
