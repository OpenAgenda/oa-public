"use strict";

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = ScrollToTop;

var _react = _interopRequireWildcard(require("react"));

var _reactRouterDom = require("react-router-dom");

var defaultLocation = {}; // https://usehooks.com/usePrevious

function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  var ref = (0, _react.useRef)(defaultLocation); // Store current value in ref

  (0, _react.useEffect)(function () {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)

  return ref.current;
}

function ScrollToTop(_ref) {
  var children = _ref.children;
  var location = (0, _reactRouterDom.useLocation)();
  var prevLocation = usePrevious(location);
  (0, _react.useEffect)(function () {
    if (location.pathname !== prevLocation.pathname) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, prevLocation.pathname]);
  return children || null;
}

module.exports = exports.default;
//# sourceMappingURL=ScrollToTop.js.map