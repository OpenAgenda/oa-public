import './lib/defineEnv.mjs';
import './lib/sourceMapSupport.mjs';

import '@openagenda/polyfills/intl.js';
import '@openagenda/polyfills/intl-locales.js';

import './lib/initLog.mjs';
import './sentry.config.mjs';

import { randomBytes } from 'node:crypto';
import logs from '@openagenda/logs';
import Sentry from '@sentry/node';
import express from 'express';
import helmet from 'helmet';
import { NotFound } from '@openagenda/verror';
import config from './config/index.js';
import app from './app.mjs';
import instanciateAPI from './api/index.mjs';
import initServices from './services/init.js';
import Core from './core/index.js';
import admin from './admin.js';
import web from './web.js';
import task from './task.mjs';
import { middleware as logRequestMw } from './services/logRequests.js';
import sentryErrorHandler from './lib/sentryErrorHandler.mjs';
import cmn from './lib/commons-app.js';
import contentSecurityPolicy from './lib/contentSecurityPolicy.js';
import { getSingleton as getGenUrlSingleton } from './services/genUrl/index.js';
import unsubscribedFront from './general/unsubscribed.front.js';

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
];

try {
  const services = await initServices();
  const core = Core(services, config);
  const api = instanciateAPI(core);

  const { sessions } = services;

  log('info', 'running server');

  const genUrl = getGenUrlSingleton();

  app.core = core;
  app.services = services;

  app.use(secureHeaders);

  app.use(sessions.mw);
  app.use(sessions.mw.load({ detailed: true }));

  app.use(logRequestMw);

  // load gen url everywhere
  app.use((req, res, next) => {
    req.genUrl = genUrl.copy(); // need genUrl only for request lifecycle
    next();
  });

  app.use(cmn.loadLogger());

  app.use(cmn.lang);

  cmn.loadLegacyRoutes(genUrl);

  // run 'admin' type modules
  if (ADMIN) {
    admin(app);
  }

  // run 'web' type modules
  if (WEB) {
    app.use('/api', api);
    web(app, config);
  }

  if (TASK || WEB) {
    unsubscribedFront(app);
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

    app.listen(config.port, () => {
      console.log(`-- Server listening on port ${config.port} --`);
    });
  }

  if (API) {
    express()
      .set('trust proxy', ['loopback', 'uniquelocal'])
      .use(
        '/v2',
        Sentry.Handlers.requestHandler(),
        secureHeaders,
        logRequestMw,
        api,
      )
      .listen(config.apiPort, () => {
        console.log(`-- API listening on port ${config.apiPort} --`);
      });
  }

  if (TASK) {
    task(config, core, services);
  }
} catch (e) {
  log('error', 'could not init app:', e);
}
