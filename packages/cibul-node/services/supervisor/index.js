"use strict";

const announcements = require('./announcements');
const elasticsearch = require('./elasticsearch');

module.exports = {
  init,
  plugApp
};

function init(config, services) {
  return {
    announcements: announcements.init(config, services),
    elasticsearch: elasticsearch.init(config, services)
  };
}

function plugApp(app, base = '/supervisor') {
  announcements.plugApp(app, `${base}/announcement`);
  elasticsearch.plugApp(app, `${base}/elasticsearch`);
}
