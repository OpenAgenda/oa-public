"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

require("core-js/modules/es.regexp.exec");

require("core-js/modules/es.string.iterator");

require("core-js/modules/es.string.match");

require("core-js/modules/es.string.split");

require("core-js/modules/web.dom-collections.iterator");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));

var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));

var _reactRouterConfig = require("react-router-config");

function esModuleInterop(mod) {
  return mod && mod.__esModule ? mod.default : mod;
}

function getParams(match) {
  return (0, _reduce.default)(match).call(match, function (result, route) {
    if (route.match && route.match.params) {
      return (0, _objectSpread2.default)((0, _objectSpread2.default)({}, result), route.match.params);
    }

    return result;
  }, {});
}

var asyncMatchRoutes = function asyncMatchRoutes(routes, pathname) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$preloadPropName = _ref.preloadPropName,
      preloadPropName = _ref$preloadPropName === void 0 ? 'load' : _ref$preloadPropName,
      skipPreload = _ref.skipPreload;

  var match = (0, _reactRouterConfig.matchRoutes)(routes, pathname.split('?')[0]);
  var params = getParams(match);
  var components = (0, _map.default)(match).call(match, function (v) {
    return v.route.component;
  });
  var skip = typeof skipPreload === 'function' && skipPreload({
    components: components,
    match: match,
    params: params
  });

  if (skip) {
    return {
      components: [],
      match: [],
      params: {}
    };
  }

  if (!skip) {
    return _promise.default.all((0, _reduce.default)(components).call(components, function (accu, component) {
      if (typeof component[preloadPropName] === 'function') {
        return (0, _concat.default)(accu).call(accu, _promise.default.resolve(component[preloadPropName]()).then(esModuleInterop));
      }

      return (0, _concat.default)(accu).call(accu, component);
    }, [])).then(function (comps) {
      return {
        components: comps,
        match: match,
        params: params
      };
    });
  }
};

asyncMatchRoutes.matchRoutes = _reactRouterConfig.matchRoutes;
asyncMatchRoutes.getParams = getParams;
var _default = asyncMatchRoutes;
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=asyncMatchRoutes.js.map