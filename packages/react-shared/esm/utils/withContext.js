import "core-js/modules/es.function.name";
import _concatInstanceProperty from "@babel/runtime-corejs3/core-js/instance/concat";
import _extends from "@babel/runtime-corejs3/helpers/extends";
import _defineProperty from "@babel/runtime-corejs3/helpers/defineProperty";
var _jsxFileName = "/home/clement/Project/oa/packages/react-shared/src/utils/withContext.js";
import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { jsx as ___EmotionJSX } from "@emotion/core";

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

export default function withContext(Context, propName) {
  return function withContextComponent(Component) {
    var _this = this,
        _context;

    var WrappedComponent = function WrappedComponent(props) {
      return ___EmotionJSX(Context.Consumer, {
        __self: _this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 11,
          columnNumber: 7
        }
      }, function (context) {
        return ___EmotionJSX(Component, _extends({}, props, _defineProperty({}, propName, context), {
          __self: _this,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 12,
            columnNumber: 21
          }
        }));
      });
    };

    WrappedComponent.displayName = _concatInstanceProperty(_context = "withContext-".concat(propName, "(")).call(_context, getDisplayName(Component), ")");
    return hoistNonReactStatics(WrappedComponent, Component);
  };
}
//# sourceMappingURL=withContext.js.map