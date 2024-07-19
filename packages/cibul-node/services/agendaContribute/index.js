import plugApp from './plugApp.js';
import verifyMemberAuthorization from './middlewares/verifyMemberAuthorization.js';

export function init(config, services) {
  return {
    mw: {
      verifyMemberAuthorization,
    },
    plugApp: plugApp(config, services),
  };
}
