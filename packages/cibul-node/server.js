import './lib/defineEnv.js';
import './lib/sourceMapSupport.js';

import '@openagenda/polyfills/intl.js';
import '@openagenda/polyfills/intl-locales.js';

import './tracing.js';
import './lib/initLog.js';

import { randomBytes } from 'node:crypto';
import logs from '@openagenda/logs';
import express from 'express';
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

const ADMIN = process.argv.includes('admin');
const TASK = process.argv.includes('task');
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

try {
  const services = await initServices(config);
  const core = Core(services, config);
  const api = instanciateAPI(core);

  const { sessions } = services;

  log('info', 'running server');

  app.core = core;
  app.services = services;

  app.use(
    secureHeaders,
    sessions.mw,
    sessions.mw.load({ detailed: true }),
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
  }

  if (TASK || WEB) {
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

    const server = app.listen(config.port, () => {
      console.log(`-- Server listening on port ${config.port} --`);
    });

    server.keepAliveTimeout = 56000;
  }

  if (API) {
    const apiServer = express()
      .set('trust proxy', ['loopback', 'uniquelocal'])
      .use('/v2', secureHeaders, logRequestMw, setAPIType('standalone'), api)
      .listen(config.apiPort, () => {
        console.log(`-- API listening on port ${config.apiPort} --`);
      });

    apiServer.keepAliveTimeout = 56000;
  }

  if (TASK) {
    task(config, core, services);
  }
} catch (e) {
  log('error', 'could not init app:', e);
}
