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

require('@openagenda/polyfills/intl');
require('@openagenda/polyfills/intl-locales');

const logs = require('@openagenda/logs');
const config = require('./config');

// init logs before requires
logs.init(config.logger || config.getLogConfig('oa', 'oa', false));

const express = require('express');
const task = require('./task');
const API = require('./api');
const initServices = require('./services/init');
const Core = require('./core');

const log = logs('server');

(async () => {
  try {
    const services = await initServices();
    const core = Core(services, config);
    const api = API(core);

    const { sessions } = services;

    log('info', 'running server');

    const app = require('./app');
    const cmn = require('./lib/commons-app');
    const genUrl = require('./services/genUrl').getSingleton();
    const admin = require('./admin');
    const web = require('./web');

    app.core = core;
    app.services = services;

    app.use(sessions.mw);
    app.use(sessions.mw.load({ detailed: true }));

    app.use(require('./services/logRequests').middleware);

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
    }

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
      });
    });

    app.use((req, res, next) => next({ code: 404 }));
    app.use((err, req, res, _next) => cmn.catchError(req, res)(err));

    app.listen(config.port, () => {
      console.log(`-- Server listening on port ${config.port} --`);
    });

    if (WEB) {
      express().use('/v2', api).listen(config.apiPort);
    }

    if (TASK) {
      task(config, core, services);
    }
  } catch (e) {
    log('error', 'could not init app:', e);
  }
})();
