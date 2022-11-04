"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/interopRequireWildcard"));

var _reactShared = require("@openagenda/react-shared");

var App = (0, _reactShared.loadable)({
  resolved: {},
  chunkName: function chunkName() {
    return "legacyEmbeds-App";
  },
  isReady: function isReady(props) {
    var key = this.resolve(props);

    if (this.resolved[key] !== true) {
      return false;
    }

    if (typeof __webpack_modules__ !== 'undefined') {
      return !!__webpack_modules__[key];
    }

    return false;
  },
  importAsync: function importAsync() {
    return _promise.default.resolve().then(function () {
      return (0, _interopRequireWildcard2.default)(require('./containers/App'));
    });
  },
  requireAsync: function requireAsync(props) {
    var _this = this;

    var key = this.resolve(props);
    this.resolved[key] = false;
    return this.importAsync(props).then(function (resolved) {
      _this.resolved[key] = true;
      return resolved;
    });
  },
  requireSync: function requireSync(props) {
    var id = this.resolve(props);

    if (typeof __webpack_require__ !== 'undefined') {
      return __webpack_require__(id);
    }

    return eval('module.require')(id);
  },
  resolve: function resolve() {
    if (require.resolveWeak) {
      return require.resolveWeak("./containers/App");
    }

    return eval('require.resolve')("./containers/App");
  }
});
var Dashboard = (0, _reactShared.loadable)({
  resolved: {},
  chunkName: function chunkName() {
    return "legacyEmbeds-App";
  },
  isReady: function isReady(props) {
    var key = this.resolve(props);

    if (this.resolved[key] !== true) {
      return false;
    }

    if (typeof __webpack_modules__ !== 'undefined') {
      return !!__webpack_modules__[key];
    }

    return false;
  },
  importAsync: function importAsync() {
    return _promise.default.resolve().then(function () {
      return (0, _interopRequireWildcard2.default)(require('./containers/Dashboard'));
    });
  },
  requireAsync: function requireAsync(props) {
    var _this = this;

    var key = this.resolve(props);
    this.resolved[key] = false;
    return this.importAsync(props).then(function (resolved) {
      _this.resolved[key] = true;
      return resolved;
    });
  },
  requireSync: function requireSync(props) {
    var id = this.resolve(props);

    if (typeof __webpack_require__ !== 'undefined') {
      return __webpack_require__(id);
    }

    return eval('module.require')(id);
  },
  resolve: function resolve() {
    if (require.resolveWeak) {
      return require.resolveWeak("./containers/Dashboard");
    }

    return eval('require.resolve')("./containers/Dashboard");
  }
});

var _default = function _default() {
  var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return [{
    path: prefix,
    component: App,
    routes: [{
      path: "".concat(prefix),
      exact: true,
      component: Dashboard
    }]
  }];
};

exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=getRoutes.js.map