"use strict";

var _ = require('lodash');
var isoConfig = require('../../iso/config');

var config = {
  initialized: false,
  sessionCookie: null,
  writableCookie: null,
  redis: null,
  interfaces: {}
};

module.exports = _.extend(config, { init: init });

function init(c) {

  _.extend(config, _.pick(c, ['sessionCookie', 'writableCookie', 'redis', 'interfaces', 'expire']));

  _.extend(config.sessionCookie, {
    name: isoConfig.cookies.session
  });

  _.extend(config.writableCookie, {
    name: isoConfig.cookies.writable
  });

  config.initialized = true;
}
//# sourceMappingURL=config.js.map