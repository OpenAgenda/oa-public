'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _ = require('lodash');
var w = require('when');
var async = require('async');
var isPromise = require('is-promise');
var promisePlusCb = require('@openagenda/service-utils/promisePlusCb');
var parseMethodArguments = require('./parseMethodArguments');

module.exports = Object.assign(method, {
  handleHook: handleHook,
  composeHook: composeHook,
  call: call
});

function method() {
  var _parseMethodArguments = parseMethodArguments.apply(null, arguments),
      hooks = _parseMethodArguments.hooks,
      callFn = _parseMethodArguments.callFn,
      options = _parseMethodArguments.options,
      cb = _parseMethodArguments.cb;

  var params = _.merge({
    defaultHook: {
      result: null,
      error: null,
      fields: [],
      data: {}
    }
  }, options);

  var hook = params.defaultHook;

  var fields = hooks.reduce(function (prev, next) {
    return prev.concat(next.field);
  }, []);

  var promise = new Promise(function (resolve, reject) {

    async.compose(composeHook(hooks, fields, 'after'), call(callFn), composeHook(hooks, fields, 'before'))(hook, function (err, result) {
      if (err && !hook.error) hook.error = err;
      hook.error ? reject(hook.error) : resolve(hook.result);
    });
  });

  // before, for:
  //    1. Pre (check, etc)
  //    2. Format
  //    3. Add validator function to a list / or merge schema to a master schema

  // call, for:
  //    1. validate
  //    2. principal call to database

  // after, for:
  //    1. Post (verify, populate, etc)
  //    2. Parse

  return promisePlusCb(promise, arguments);
}

function handleHook(type, hook, step, fields, i) {
  return [].concat(step[type]).map(function (v) {
    return function (_hook, next) {
      next = _.once(next);

      var _field = _.clone(fields[i]);
      var field = _.clone(_field);

      var handle = function handle(err, result) {

        if (!_.isEqual(field, _field)) {
          fields[i] = _.clone(field);
          _field = _.clone(field);
        }

        if (type === 'before') {
          if (!_.isEqual(_.last(hook.fields), _field) && hook.fields[i]) {
            hook.fields[hook.fields.length - 1] = field;
          } else {
            hook.fields.push(field);
          }
        } else if (type === 'after') {
          var index = hook.fields.findIndex(function (v) {
            return _.isEqual(v, _field);
          });
          hook.fields[index] = field;
        }

        if (err) {
          _hook.error = err;
          return next(_hook);
        }
        if (result !== undefined) {
          _hook = result;
        }
        next(null, _hook);
      };

      var res = void 0;

      res = v(field, fields, _hook, handle);
      if (isPromise(res)) w(res).done(handle.bind(null, null), handle);
    };
  });
}

function composeHook(hooks, fields, type) {
  return function (hook, cb) {

    var _hooks = hooks.reduce(function (prev, next, i) {
      if (next[type]) return prev.concat(handleHook(type, hook, next, fields, i));
      return prev.concat(handleHook(type, hook, Object.assign({}, next, _defineProperty({}, type, function (f, fs, _hook, next) {
        return next();
      })), fields, i));
    }, []);

    async.compose.apply(null, _hooks.reverse())(hook, cb);
  };
}

function call(fn) {
  return function (hook, cb) {
    cb = _.once(cb);

    var handle = function handle(err, result) {
      if (err) {
        hook.error = err;
        return cb(hook);
      }
      if (result !== undefined) {
        hook.result = result;
      }
      cb(null, hook);
    };

    var res = void 0;

    res = fn(hook, handle);
    if (isPromise(res)) w(res).done(handle.bind(null, null), handle);
  };
}
//# sourceMappingURL=method.js.map