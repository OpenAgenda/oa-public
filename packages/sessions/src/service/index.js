"use strict";

const _ = require( 'lodash' );
const logger = require( '@openagenda/logs' );
const mw = require( '../middleware' );
const isoConfig = require( '../../iso/config' );
const cookieValidate = require( '../../iso/cookie.validate' );
const expressCookie = require( './expressCookie' );
const get = require( './get' );
const open = require( './open' );
const close = require( './close' );
const scan = require( './scan' );
const sync = require( './sync' );

function getCulture( request ) {
  try {
    const user = cookieValidate( request.session ).user;

    if ( user ) return user.culture;

  } catch ( e ) {
    console.log( e );
  }

  return null;
}


module.exports = (options = {}) => {
  const config = Object.assign({
    initialized: false,
    redisClient: null,
    interfaces: {},
    sessionCookie: Object.assign({}, options.sessionCookie ?? null, {
      name: isoConfig.cookies.session
    }),
    writableCookie: Object.assign({}, options.writableCookie, {
      name: isoConfig.cookies.writable
    }),
  }, options);

  if (options.logger) {
    logger.setModuleConfig(options.logger);
  }

  const service = {
    get: get.bind(null, config),
    open: open.bind(null, config),
    close: close.bind(null, config),
    sync: sync.bind(null, config),
    scan: scan.bind(null, config),
    setFlash: (req, res, message) => expressCookie(config, req, res).set('flash', message),
    isLogged: async request => !!(await get.promise(config, request)),
    getCulture,
  };

  service.mw = mw(service, config);

  return service;
}
