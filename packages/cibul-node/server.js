'use strict';

/* eslint global-require: "off", import/order: "off" */

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line import/no-extraneous-dependencies
  require('source-map-support').install({ hookRequire: true });
}

const ADMIN = process.argv.includes('admin');
const TASK = process.argv.includes('task');
const WEB = process.argv.includes('web');
const API = process.argv.includes('api');

require('@openagenda/polyfills/intl');
require('@openagenda/polyfills/intl-locales');

const logs = require('@openagenda/logs');
const config = require('./config');

// init logs before requires
logs.init(config.logger || config.getLogConfig('oa', 'oa', false));

require('./sentry.config');

const Sentry = require('@sentry/node');
const express = require('express');
const helmet = require('helmet');
const { NotFound } = require('@openagenda/verror');
const task = require('./task');
const instanciateAPI = require('./api');
const initServices = require('./services/init');
const Core = require('./core');
const sentryErrorHandler = require('./lib/sentryErrorHandler');

const log = logs('server');

(async () => {
  try {
    const services = await initServices();
    const core = Core(services, config);
    const api = instanciateAPI(core);

    const { sessions } = services;

    log('info', 'running server');

    const app = require('./app');
    const cmn = require('./lib/commons-app');
    const genUrl = require('./services/genUrl').getSingleton();
    const admin = require('./admin');
    const web = require('./web');
    const logRequestMw = require('./services/logRequests').middleware;

    app.core = core;
    app.services = services;

    const secureHeaders = [
      helmet.strictTransportSecurity(config.hsts),
      helmet.xFrameOptions(),
    ];

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
      require('./general/unsubscribed.front')(app);
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
})();
