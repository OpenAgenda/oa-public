'use strict';

const plugApp = require('./plugApp');
const verifyMemberAuthorization = require('./middlewares/verifyMemberAuthorization');

module.exports.init = (config, services) => ({
  mw: {
    verifyMemberAuthorization,
  },
  plugApp: plugApp(config, services),
});
