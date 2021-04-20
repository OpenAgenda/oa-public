"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _objectSpread3 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));

var _react = _interopRequireDefault(require("react"));

var _reactRouterDom = require("react-router-dom");

var _core = require("@emotion/core");

var _this = void 0,
    _jsxFileName = "/home/clement/Project/oa/packages/react-shared/src/components/NotFound.js";

var NotFound = function NotFound(_ref) {
  var staticContext = _ref.staticContext,
      route = _ref.route,
      location = _ref.location;
  var locationState = location.state || {};
  var newLocationState = (0, _objectSpread3.default)((0, _objectSpread3.default)({}, locationState), {}, {
    notFound: (0, _objectSpread3.default)((0, _objectSpread3.default)({}, locationState.notFound), {}, (0, _defineProperty2.default)({}, route.notFoundKey, true))
  });

  if (staticContext) {
    staticContext.status = 404;
  }

  return (0, _core.jsx)(_reactRouterDom.Redirect, {
    to: {
      state: newLocationState
    },
    __self: _this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 18,
      columnNumber: 10
    }
  });
};

NotFound.Capture = (0, _reactRouterDom.withRouter)(function (_ref2) {
  var children = _ref2.children,
      location = _ref2.location,
      notFoundKey = _ref2.notFoundKey;
  return location && location.state && location.state.notFound && location.state.notFound[notFoundKey] ? null : children;
});
NotFound.isNotFound = true;
var _default = NotFound;
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=NotFound.js.map