'use strict';

const _ = require('lodash');
const createCSSFile = require('./createCSSFile');
const log = require('./Log')('launch');

function _ready() {
  log('**** app is running and ready ****');

  // ready: used by PM2 https://pm2.io/doc/en/runtime/best-practices/graceful-shutdown/#graceful-start
  // online: used by browser-refresh

  if (process.send) process.send(process.env.NODE_ENV === 'development' ? 'online' : 'ready');
}

async function _development(/* app, port */) {
  log('launching in development environment');

  _ready();
}

async function _production(app /* , port */) {
  if (!app.locals.root) throw new Error('app root is not set');

  log('launching in production environment');

  const { sass, assets } = _.assign(
    {
      sass: `${__dirname}/../sass/main.scss`,
      assets: `${__dirname}/../assets`
    },
    app.locals
  );

  await createCSSFile(sass, assets);

  _ready();
}

module.exports = (app, port = 80) => {
  app.listen(port, () => (process.env.NODE_ENV === 'development' ? _development : _production)(
    app,
    port
  ));
};
