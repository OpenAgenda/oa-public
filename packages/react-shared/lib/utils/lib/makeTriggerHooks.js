"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

require("core-js/modules/es.regexp.exec");

require("core-js/modules/es.string.match");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = makeTriggerHooks;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _assign = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/assign"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _every = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/every"));

var _setTimeout2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/set-timeout"));

require("regenerator-runtime/runtime");

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));

var _redial = require("redial");

var _asyncMatchRoutes = _interopRequireDefault(require("./asyncMatchRoutes"));

function haveHooks(hooks, components) {
  return (0, _some.default)(hooks).call(hooks, function (hook) {
    return (0, _some.default)(components).call(components, function (v) {
      return v['@@redial-hooks'] && v['@@redial-hooks'][hook];
    });
  });
}

function makeTriggerHooks(_ref) {
  var routes = _ref.routes,
      history = _ref.history,
      helpers = _ref.helpers,
      req = _ref.req;
  return /*#__PURE__*/(0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
    var _ref3,
        pathname,
        _ref3$hooks,
        hooks,
        onStart,
        onFinish,
        notFound,
        isStarted,
        isFinished,
        start,
        _yield$asyncMatchRout,
        components,
        match,
        params,
        compsHaveHooks,
        _args = arguments;

    return _regenerator.default.wrap(function _callee$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _ref3 = _args.length > 0 && _args[0] !== undefined ? _args[0] : {}, pathname = _ref3.pathname, _ref3$hooks = _ref3.hooks, hooks = _ref3$hooks === void 0 ? ['inject', 'fetch', 'defer'] : _ref3$hooks, onStart = _ref3.onStart, onFinish = _ref3.onFinish;
            notFound = null;
            isStarted = false;
            isFinished = false; // Avoid synchronous onStart -> onFinish

            start = function start() {
              return (0, _setTimeout2.default)(function () {
                if (!isStarted && !isFinished) {
                  isStarted = true;
                  onStart();
                }
              });
            };

            _context3.next = 7;
            return (0, _asyncMatchRoutes.default)(routes, pathname || (req ? req.originalUrl : history.location.pathname), {
              skipPreload: function skipPreload(result) {
                var _context, _context2;

                var comps = result.components;
                notFound = !(0, _some.default)(_context = result.match).call(_context, function (v) {
                  return v.route.component && !v.route.routes;
                });

                if (typeof onStart === 'function' && !notFound // is found
                && (0, _some.default)(comps).call(comps, function (v) {
                  return v.load;
                }) // at least one have load fn
                && !(0, _every.default)(_context2 = (0, _filter.default)(comps // not already loaded
                ).call(comps, function (v) {
                  return v.load;
                })).call(_context2, function (v) {
                  return typeof v.isReady === 'function' && v.isReady();
                })) {
                  start();
                }

                return notFound;
              }
            });

          case 7:
            _yield$asyncMatchRout = _context3.sent;
            components = _yield$asyncMatchRout.components;
            match = _yield$asyncMatchRout.match;
            params = _yield$asyncMatchRout.params;
            compsHaveHooks = haveHooks(hooks, components);

            if (!notFound && !isStarted && typeof onStart === 'function' && compsHaveHooks) {
              start();
            }

            (0, _assign.default)(helpers, {
              match: match,
              params: params
            });

            if (!(0, _includes.default)(hooks).call(hooks, 'inject')) {
              _context3.next = 17;
              break;
            }

            _context3.next = 17;
            return (0, _redial.trigger)('inject', components, helpers);

          case 17:
            if (!(typeof window !== 'undefined' && window.__PRELOADED__)) {
              _context3.next = 21;
              break;
            }

            // Delete initial data so that subsequent data fetches can occur:
            delete window.__PRELOADED__;
            _context3.next = 24;
            break;

          case 21:
            if (!(0, _includes.default)(hooks).call(hooks, 'fetch')) {
              _context3.next = 24;
              break;
            }

            _context3.next = 24;
            return (0, _redial.trigger)('fetch', components, helpers);

          case 24:
            if (!(typeof window !== 'undefined' && (0, _includes.default)(hooks).call(hooks, 'defer'))) {
              _context3.next = 27;
              break;
            }

            _context3.next = 27;
            return (0, _redial.trigger)('defer', components, helpers);

          case 27:
            isFinished = true;

            if (isStarted && typeof onFinish === 'function') {
              (0, _setTimeout2.default)(function () {
                onFinish();
              });
            }

          case 29:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee);
  }));
}

module.exports = exports.default;
//# sourceMappingURL=makeTriggerHooks.js.map