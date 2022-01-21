'use strict';

const log = require('./Log')('launch');

function _ready(port) {
  log('**** App is running and ready ****');
  log(`Currently running on port ${port}`);

  // ready: used by PM2 https://pm2.io/doc/en/runtime/best-practices/graceful-shutdown/#graceful-start
  // online: used by browser-refresh

  if (process.send) process.send(process.env.NODE_ENV === 'development' ? 'online' : 'ready');
}

module.exports = (app, port = 80) => {
  app.listen(port, () => {
    if (process.env.NODE_ENV === 'production' && !app.locals.root) {
      throw new Error('app root is not set');
    }

    log(`launching in ${process.env.NODE_ENV === 'development' ? 'development' : 'production'} environment`);

    _ready(port);
  });
};
