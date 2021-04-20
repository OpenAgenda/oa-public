import "core-js/modules/es.regexp.exec";
import "core-js/modules/es.string.match";
import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import _Object$assign from "@babel/runtime-corejs3/core-js/object/assign";
import _filterInstanceProperty from "@babel/runtime-corejs3/core-js/instance/filter";
import _everyInstanceProperty from "@babel/runtime-corejs3/core-js/instance/every";
import _setTimeout from "@babel/runtime-corejs3/core-js/set-timeout";
import "regenerator-runtime/runtime";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/asyncToGenerator";
import _someInstanceProperty from "@babel/runtime-corejs3/core-js/instance/some";
import { trigger } from 'redial';
import asyncMatchRoutes from './asyncMatchRoutes';

function haveHooks(hooks, components) {
  return _someInstanceProperty(hooks).call(hooks, function (hook) {
    return _someInstanceProperty(components).call(components, function (v) {
      return v['@@redial-hooks'] && v['@@redial-hooks'][hook];
    });
  });
}

export default function makeTriggerHooks(_ref) {
  var routes = _ref.routes,
      history = _ref.history,
      helpers = _ref.helpers,
      req = _ref.req;
  return /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
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

    return _regeneratorRuntime.wrap(function _callee$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _ref3 = _args.length > 0 && _args[0] !== undefined ? _args[0] : {}, pathname = _ref3.pathname, _ref3$hooks = _ref3.hooks, hooks = _ref3$hooks === void 0 ? ['inject', 'fetch', 'defer'] : _ref3$hooks, onStart = _ref3.onStart, onFinish = _ref3.onFinish;
            notFound = null;
            isStarted = false;
            isFinished = false; // Avoid synchronous onStart -> onFinish

            start = function start() {
              return _setTimeout(function () {
                if (!isStarted && !isFinished) {
                  isStarted = true;
                  onStart();
                }
              });
            };

            _context3.next = 7;
            return asyncMatchRoutes(routes, pathname || (req ? req.originalUrl : history.location.pathname), {
              skipPreload: function skipPreload(result) {
                var _context, _context2;

                var comps = result.components;
                notFound = !_someInstanceProperty(_context = result.match).call(_context, function (v) {
                  return v.route.component && !v.route.routes;
                });

                if (typeof onStart === 'function' && !notFound // is found
                && _someInstanceProperty(comps).call(comps, function (v) {
                  return v.load;
                }) // at least one have load fn
                && !_everyInstanceProperty(_context2 = _filterInstanceProperty(comps // not already loaded
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

            _Object$assign(helpers, {
              match: match,
              params: params
            });

            if (!_includesInstanceProperty(hooks).call(hooks, 'inject')) {
              _context3.next = 17;
              break;
            }

            _context3.next = 17;
            return trigger('inject', components, helpers);

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
            if (!_includesInstanceProperty(hooks).call(hooks, 'fetch')) {
              _context3.next = 24;
              break;
            }

            _context3.next = 24;
            return trigger('fetch', components, helpers);

          case 24:
            if (!(typeof window !== 'undefined' && _includesInstanceProperty(hooks).call(hooks, 'defer'))) {
              _context3.next = 27;
              break;
            }

            _context3.next = 27;
            return trigger('defer', components, helpers);

          case 27:
            isFinished = true;

            if (isStarted && typeof onFinish === 'function') {
              _setTimeout(function () {
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
//# sourceMappingURL=makeTriggerHooks.js.map