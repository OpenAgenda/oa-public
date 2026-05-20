import './lib/defineEnv.js';
import './lib/sourceMapSupport.js';

import '@openagenda/polyfills/intl.js';
import '@openagenda/polyfills/intl-locales.js';

// eslint-disable-next-line import/order
import './lib/initLog.js';

import { randomBytes } from 'node:crypto';
import logs from '@openagenda/logs';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { NotFound } from '@openagenda/verror';
import config from './config/index.js';
import app from './app.js';
import instanciateAPI from './api/index.js';
import setAPIType from './api/middleware/setAPIType.js';
import initServices from './services/init.js';
import Core from './core/index.js';
import web from './web.js';
import task from './task.js';
import { middleware as logRequestMw } from './services/logRequests.js';
import sentryErrorHandler from './lib/sentryErrorHandler.js';
import cmn from './lib/commons-app.js';
import contentSecurityPolicy from './lib/contentSecurityPolicy.js';
import * as otelMw from './lib/otelMw.js';
import redirectRootLangPaths from './lib/redirectRootLangPaths.js';
import handleGracefulShutdown from './lib/handleGracefulShutdown.js';
import visitorId from './lib/visitorId.js';
import { loadUser } from './lib/authGuards.js';

const ADMIN = process.argv.includes('admin');
const TASKS = process.argv
  .filter((a) => a.includes('task'))
  .map((t) => t.split(':').pop());
const WEB = process.argv.includes('web');
const API = process.argv.includes('api');

const log = logs('server');

const secureHeaders = [
  (req, res, next) => {
    req.app = app;
    res.setHeader('Reporting-Endpoints', `default="${config.root}/reports"`);
    res.locals.cspNonce = randomBytes(16).toString('base64');
    next();
  },
  contentSecurityPolicy(),
  helmet.strictTransportSecurity(config.hsts),
  helmet.xFrameOptions(),
  helmet.referrerPolicy({
    policy: ['no-referrer', 'strict-origin-when-cross-origin'],
  }),
  helmet.xContentTypeOptions(),
];

function rawBodySaver(req, res, buf) {
  req.rawBody = buf;
}

try {
  const services = await initServices(config);
  const core = Core(services, config);
  const api = instanciateAPI(core);

  log('info', 'running server');
  let webServer;
  let apiServer;

  app.core = core;
  app.services = services;

  // better-auth handler must run BEFORE body-parser (it reads its own body).
  if (services.auth) {
    // Deny public access to OA-internal BA plugin endpoints (oa-impersonation:
    // POST /api/auth/oa/open-session). They are server-to-server only —
    // `auth.api.*` calls bypass Express entirely. This guard MUST run before
    // the catch-all `/api/auth/*` handler so the precedence works.
    app.all('/api/auth/oa/*', (req, res) => res.sendStatus(404));
    app.all('/api/auth/*', services.auth.nodeHandler);
  }

  app.use(
    bodyParser.json({ limit: '5mb', verify: rawBodySaver }),
    bodyParser.urlencoded({
      limit: '500kb',
      extended: true,
      verify: rawBodySaver,
    }),
    secureHeaders,
    cookieParser(),
    visitorId,
    loadUser,
    otelMw.addUserContext,
    logRequestMw,
    redirectRootLangPaths,
  );

  // load gen url everywhere
  app.use((req, res, next) => {
    req.genUrl = services.genUrl.copy(); // need genUrl only for request lifecycle
    next();
  });

  app.use(cmn.loadLogger());

  app.use(cmn.lang);

  cmn.loadLegacyRoutes(services.genUrl);

  // run 'admin' type modules
  if (ADMIN) {
    app.services.superadmin.plugApp(app, '/admin');
  }

  // run 'web' type modules
  if (WEB) {
    app.use('/api', setAPIType('UI'));
    app.use('/api', api);
    web(app, config);
    app.use((req, res, next) => {
      if (res.data === undefined) {
        return next();
      }

      res.format({
        text() {
          res.send(res.data);
        },
        html() {
          res.send(res.data);
        },
        json() {
          res.json(res.data);
        },
        default() {
          res.send(res.data);
        },
      });
    });

    app.use((req, res, next) => next(new NotFound()));

    app.use(sentryErrorHandler({ tag: 'app' }));
    app.use((err, req, res, _next) => cmn.catchError(req, res)(err));

    webServer = app.listen(config.port, () => {
      console.log(`-- Server listening on port ${config.port} --`);
    });

    webServer.keepAliveTimeout = 56000;
  }

  if (API) {
    apiServer = express()
      .set('trust proxy', ['loopback', 'uniquelocal'])
      .use('/v2', secureHeaders, logRequestMw, setAPIType('standalone'), api)
      .listen(config.apiPort, () => {
        console.log(`-- API listening on port ${config.apiPort} --`);
      });

    apiServer.keepAliveTimeout = 56000;
  }

  if (TASKS.length) {
    task(config, core, services, TASKS);
  }

  handleGracefulShutdown(
    {
      web: webServer,
      api: apiServer,
    },
    services,
  );
} catch (e) {
  log('error', 'could not init app:', e);
  process.exit(1);
}
