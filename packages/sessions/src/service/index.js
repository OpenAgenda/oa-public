import logger from '@openagenda/logs';
import mw from '../middleware.js';
import isoConfig from '../iso/config.js';
import cookieValidate from '../iso/cookie.validate.js';
import get, { promise as getPromise } from './get.js';
import refresh from './refresh.js';
import open from './open.js';
import * as close from './close.js';
import scan from './scan.js';
import sync from './sync.js';

function getCulture(request) {
  try {
    const { user } = cookieValidate(request.session);

    if (user) return user.culture;
  } catch (e) {
    console.log(e);
  }

  return null;
}

export default (options = {}) => {
  const config = {
    initialized: false,
    redisClient: null,
    interfaces: {},
    sessionCookie: {
      ...options.sessionCookie ?? null,
      name: isoConfig.cookies.session,
    },
    ...options,
  };

  if (options.logger) {
    logger.setModuleConfig(options.logger);
  }

  const service = {
    get: get.bind(null, config),
    refresh: refresh.bind(null, config),
    open: open.bind(null, config),
    close: close.default.bind(null, config),
    sync: sync.bind(null, config),
    scan: scan.bind(null, config),
    isLogged: async (request) => !!await getPromise(config, request),
    getCulture,
  };

  service.close.byUid = close.byUid.bind(null, config);

  service.mw = mw(service);

  return service;
};
