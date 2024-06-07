import plugApp from './plugApp.mjs';
import verifyMemberAuthorization from './middlewares/verifyMemberAuthorization.mjs';

export function init(config, services) {
  return {
    mw: {
      verifyMemberAuthorization,
    },
    plugApp: plugApp(config, services),
  };
}
