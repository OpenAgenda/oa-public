'use strict';

module.exports = function (hooks, callFn, options, cb) {

  var result = {
    hooks: hooks,
    callFn: callFn,
    options: options,
    cb: cb
  };

  var args = Array.isArray(arguments) ? arguments : Array.from(arguments);

  if (typeof args[args.length - 1] !== 'function') {
    args.push(null);
  }

  if (args.length === 3) {

    Object.assign(result, {
      hooks: args[0],
      callFn: args[1],
      cb: args[2]
    });
  }

  return result;
};
//# sourceMappingURL=parseMethodArguments.js.map