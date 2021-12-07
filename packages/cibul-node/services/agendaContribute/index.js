'use strict';

// const contribute = require('@openagenda/agenda-contribute');

// const layout = require('../lib/layouts').agenda;
const plugApp = require('./plugApp');

const verifyMemberAuthorization = require('./middlewares/verifyMemberAuthorization');
// const interfaces = require('./interfaces');

module.exports.init = (config, services) => {
  /* contribute.init({
    logger: config.getLogConfig('svc', 'agendaContribute'),
    CDNPath: config.aws.servicesBucketPath,
    tiles: config.tiles,
    staticTiles: config.staticTiles,
    maxFileSize: parseInt(config.maxFileSize / 1000000, 10),
    frontAppPath: process.env.NODE_ENV !== 'production' ? '/dist/contribute' : null,
    layout,
    middlewares,
    interfaces: interfaces(services)
  }); */

  return {
    mw: {
      verifyMemberAuthorization
    },
    plugApp: plugApp(config, services)
  };
};
