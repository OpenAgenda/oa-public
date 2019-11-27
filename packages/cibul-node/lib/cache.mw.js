'use strict';

const _ = require('lodash');

module.exports.send = (namespace, path, onSuccess) => {
  return (req, res, next) => {
    req.app.services.simpleCache(namespace, _.get(req, path)).get(req.url, (err, value) => {
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

    req.app.services.simpleCache(namespace, identifier).set(req.url, cacheFunc(req), delay, err => {
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
