/* eslint-disable */

import logs from '@openagenda/logs';
import lib from './lib.js';

const log = logs('function cache');

export default (namespace, name, func, expire) => {
  if (!lib.enabled()) {
    return Object.assign(func, {
      cache: {
        clear() {},
      },
    });
  }

  return Object.assign(wrapper, {
    cache: {
      clear,
    },
  });

  function wrapper() {
    const args = Array.prototype.slice.call(arguments);

    const cb = args.pop();

    const key = _setCacheKey(namespace, name, args);

    lib.get(key, (err, data) => {
      if (!data) {
        _log(key, 'no data was retrieved');

        return lib.load.apply(null, [key, func, expire].concat(args, cb));
      }

      _log(key, 'cached data was retrieved');

      cb(null, data);
    });
  }

  function clear(args, cb) {
    var args = Array.prototype.slice.call(arguments);

    var cb = args.pop();

    const key = _setCacheKey(namespace, name, args);

    _log(key, 'clearing');

    lib.getCli().del(key, cb);
  }
};

function _log(key, message) {
  const args = Array.prototype.slice.call(arguments);

  args.pop();

  log(...[`%s - ${message}`].concat(args));
}

function _setCacheKey(namespace, name, values) {
  const key = ['cache', namespace, name, JSON.stringify(values)];

  return key.join(':');
}
