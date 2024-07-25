/* eslint-disable */

import logs from '@openagenda/logs';
import lib from './lib.js';

const log = logs('instance cache');

/**
 * @param { string }    type       type of the instance ( ex user, agenda, event )
 * @param { object }    instance   instance to be cached
 * @param { array }     methods    methods to be cached
 * @param { array }     clearers   methods that when called clear the instance cache
 */

export default (type, instance, methods, clearers) => {
  const key = _setCacheKey(type, instance);

  if (!lib.enabled()) {
    return Object.assign(instance, {
      cache: {
        clear() {},
      },
    });;
  }

  if (!clearers) clearers = [];

  if (instance.save) clearers.push('save');

  const cachedMethods = _wrapMethods(methods);

  const clearerMethods = _wrapClearers(clearers);

  let cacheTimestamp;

  // extend instance with cache specific methods
  return Object.assign(instance, clearerMethods, cachedMethods, {
    cache: {
      clear,
      getTimestamp,
    },
  });

  function _wrapMethods(methods) {
    const cachedMethods = {};

    methods.forEach(methodName => {
      cachedMethods[methodName] = _wrapMethod(methodName, instance[methodName]);
    });

    return cachedMethods;
  }

  function _wrapClearers(clearers) {
    const clearerMethods = {};

    clearers.forEach(methodName => {
      clearerMethods[methodName] = _wrapClearer(instance[methodName]);
    });

    return clearerMethods;
  }

  /**
   * wrap given function to add a cache clear
   */

  function _wrapClearer(method) {
    return function(...args) {
      // clears the cache
      clear();

      // while applying the function
      method(...Array.prototype.slice.apply(args));
    };
  }

  function _wrapMethod(methodName, method) {
    return function (cb) {
      if (arguments.length > 1) {
        return method(...Array.prototype.slice.apply(arguments));
      }

      _log(methodName, 'is cacheable');

      _validTimestamp((err, isValid) => {
        if (isValid) {
          _log(methodName, 'cache timestamp is valid');

          lib.get(key, methodName, (err, data) => {
            if (!data) {
              _log(methodName, 'no cached data was retrieved');

              return lib.load([key, methodName], method, false, cb);
            }
            _log(methodName, 'cached data was retrieved');

            cb(null, data);
          });
        } else {
          _log(methodName, 'cache timestamp is not valid');

          clear(err => {
            if (err) return cb(err);

            lib.load([key, methodName], method, false, cb);
          });
        }
      });
    };
  }

  function _validTimestamp(cb) {
    getTimestamp((err, cacheTimestamp) => {
      cb(err, _stringifyTimestamp(instance.updatedAt) == _stringifyTimestamp(cacheTimestamp));
    });
  }

  function getTimestamp(cb) {
    if (cacheTimestamp) {
      return cb(null, cacheTimestamp);
    }

    lib.getCli().hget(key, 'timestamp', cb);
  }

  function clear(cb) {
    _log('clearing');

    lib.getCli().del(key, err => {
      if (err) return cb(err);

      cacheTimestamp = instance.updatedAt;

      lib.getCli().hset(key, 'timestamp', cacheTimestamp, err => {
        if (cb) cb(err);
      });
    });
  }

  function _log(method, message, args) {
    log(...[`%s.%s - ${message}`, key, method].concat(args || []));
  }
};

function _setCacheKey(type, instance) {
  return ['cache', 'instance', type, instance.id].join(':');
}

/**
 * format timestamp like this: 2015-06-09T14:04:03.000Z
 */

function _stringifyTimestamp(t) {
  if (typeof t === 'string' && t.includes('GMT')) {
    t = new Date(t);
  }

  if (typeof t === 'object') t = JSON.parse(JSON.stringify(t));

  return t;
}
