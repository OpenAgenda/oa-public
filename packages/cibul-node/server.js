"use strict";

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
}

const supervisor = require('./lib/supervisor');

const ADMIN = process.argv.includes('admin');
const TASK = process.argv.includes('task');
const WEB = process.argv.includes('web');


supervisor(async loadTasks => {
  try {
    const services = await require('./services/init')();

    services.core = require('./core');

    services.core.tasks.loadQueue();

    if (__DEVELOPMENT__) {
      require('source-map-support').install({ hookRequire: true });
    }

    const logs = require('@openagenda/logs');
    const log = logs('server');

    log('info', 'running server');

    const sessions = require('@openagenda/sessions');
    const app = require('./app');
    const cmn = require('./lib/commons-app');
    const genUrl = require('./services/genUrl').getSingleton();
    const config = require('./config');
    const admin = require('./admin');
    const web = require('./web');

    app.services = services;

    app.use(sessions.middleware);
    app.use(sessions.middleware.load({ detailed: true }));

    app.use(require('./services/logRequests').middleware);

    // load gen url everywhere
    app.use((req, res, next) => {
      req.genUrl = genUrl.copy(); // need genUrl only for request lifecycle
      next();
    });

    app.use((req, res, next) => {
      req.log = logs('req', { url: req.originalUrl });
      next();
    });

    app.use(cmn.lang);

    cmn.loadLegacyRoutes(genUrl);

    // run 'admin' type modules
    if (ADMIN) {
      admin(app);
    }

    // run 'web' type modules
    if (WEB) {
      web(app);
    }

    if (TASK || WEB) {
      require('./legacy/back')(app);
      require('./general/unsubscribed.front')(app);
      require('./agenda/json.export')(app);
      require('./agenda/exports')(app);
    }

    app.use((req, res, next) => {
      if (res.data === undefined) {
        return next();
      }

      res.format({
        'application/json': function () {
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
      require('./api');
    }

    // only one process runs background tasks. supervisor handles that.
    // only 'task' types run tasks
    if (loadTasks && TASK) {
      require('./task')();
    }
  } catch (e) {
    const logs = require('@openagenda/logs');
    const log = logs('server');

    log('error', 'could not init app:', e);
  }
});
