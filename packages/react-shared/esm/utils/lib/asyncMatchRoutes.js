import "core-js/modules/es.array.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise";
import "core-js/modules/es.regexp.exec";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.match";
import "core-js/modules/es.string.split";
import "core-js/modules/web.dom-collections.iterator";
import _concatInstanceProperty from "@babel/runtime-corejs3/core-js/instance/concat";
import _Promise from "@babel/runtime-corejs3/core-js/promise";
import _mapInstanceProperty from "@babel/runtime-corejs3/core-js/instance/map";
import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import { matchRoutes } from 'react-router-config';

function esModuleInterop(mod) {
  return mod && mod.__esModule ? mod.default : mod;
}

function getParams(match) {
  return _reduceInstanceProperty(match).call(match, function (result, route) {
    if (route.match && route.match.params) {
      return _objectSpread(_objectSpread({}, result), route.match.params);
    }

    return result;
  }, {});
}

var asyncMatchRoutes = function asyncMatchRoutes(routes, pathname) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$preloadPropName = _ref.preloadPropName,
      preloadPropName = _ref$preloadPropName === void 0 ? 'load' : _ref$preloadPropName,
      skipPreload = _ref.skipPreload;

  var match = matchRoutes(routes, pathname.split('?')[0]);
  var params = getParams(match);

  var components = _mapInstanceProperty(match).call(match, function (v) {
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
    return _Promise.all(_reduceInstanceProperty(components).call(components, function (accu, component) {
      if (typeof component[preloadPropName] === 'function') {
        return _concatInstanceProperty(accu).call(accu, _Promise.resolve(component[preloadPropName]()).then(esModuleInterop));
      }

      return _concatInstanceProperty(accu).call(accu, component);
    }, [])).then(function (comps) {
      return {
        components: comps,
        match: match,
        params: params
      };
    });
  }
};

asyncMatchRoutes.matchRoutes = matchRoutes;
asyncMatchRoutes.getParams = getParams;
export default asyncMatchRoutes;
//# sourceMappingURL=asyncMatchRoutes.js.map