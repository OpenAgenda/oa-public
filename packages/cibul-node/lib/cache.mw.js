'use strict';

const _ = require('lodash');

module.exports.send = (namespace, path, onSuccess) => {
  return (req, res, next) => {
    req.app.services.simpleCache(namespace, _.get(req, path)).get(_sanitizeUrl(req), (err, value) => {
      if (err) return next(err);

      if (value !== null) {
        req.log('info', {
          cached: namespace + ':' + _.get(req, path),
          message: 'cached response'
        });

        return onSuccess(value, req, res);
      }

      next();
    });
  }
}

module.exports.set = (namespace, path, delay, cacheFunc) => {
  return (req, res, next) => {
    req.log('caching');

    const identifier = _.get(req, path);

    req.app.services.simpleCache(namespace, identifier).set(_sanitizeUrl(req), cacheFunc(req), delay, err => {
      if (err) {
        req.log('error', {
          cached: namespace + ':' + identifier,
          error: err, message: 'caching error'
        });
      } else {
        req.log('info', {
          cached: namespace + ':' + identifier,
          message: 'caching successful'
        });
      }
    });

    next();
  }
}

/**
 * remove the bits irrelevent for cache key
 */
function _sanitizeUrl(req) {
  if (req.url.indexOf('?')===-1) return req.url;

  const parts = req.url.split('?');

  return [
    parts[0],
    parts[1].split('&')
      .map(qPart => qPart.split('='))
      .filter(kv => !['key', 'callback', '_'].includes(kv[0]))
      .map(kv => kv.join('='))
      .join('&')
  ].join('?');
}
