"use strict";

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const sourceMapSupport = require('source-map-support');
const express = require('express');
require('@openagenda/polyfills/intl');
require('@openagenda/polyfills/intl-locales');
const logs = require('@openagenda/logs');

const loadServicesAndCore = require('./loadServicesAndCore');
const task = require('./task');
const API = require('./api');

const ADMIN = process.argv.includes('admin');
const TASK = process.argv.includes('task');
const WEB = process.argv.includes('web');

(async () => {
  try {
    const {
      services,
      core,
      config
    } = await loadServicesAndCore();

    const api = API(core);

    const {
      sessions
    } = services;

    if (__DEVELOPMENT__) {
      sourceMapSupport.install({ hookRequire: true });
    }

    const log = logs('server');

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
      require('./legacy/back')(app);
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
        }
      });
    });

    app.use((req, res, next) => next({ code: 404 }));
    app.use((err, req, res, next) => cmn.catchError(req, res)(err));

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
    const logs = require('@openagenda/logs');
    const log = logs('server');

    log('error', 'could not init app:', e);
  }
})();
