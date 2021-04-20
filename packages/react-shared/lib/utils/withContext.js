"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

require("core-js/modules/es.function.name");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = withContext;

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));

var _extends2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _hoistNonReactStatics = _interopRequireDefault(require("hoist-non-react-statics"));

var _core = require("@emotion/core");

var _jsxFileName = "/home/clement/Project/oa/packages/react-shared/src/utils/withContext.js";

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

function withContext(Context, propName) {
  return function withContextComponent(Component) {
    var _this = this,
        _context;

    var WrappedComponent = function WrappedComponent(props) {
      return (0, _core.jsx)(Context.Consumer, {
        __self: _this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 11,
          columnNumber: 7
        }
      }, function (context) {
        return (0, _core.jsx)(Component, (0, _extends2.default)({}, props, (0, _defineProperty2.default)({}, propName, context), {
          __self: _this,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 12,
            columnNumber: 21
          }
        }));
      });
    };

    WrappedComponent.displayName = (0, _concat.default)(_context = "withContext-".concat(propName, "(")).call(_context, getDisplayName(Component), ")");
    return (0, _hoistNonReactStatics.default)(WrappedComponent, Component);
  };
}

module.exports = exports.default;
//# sourceMappingURL=withContext.js.map