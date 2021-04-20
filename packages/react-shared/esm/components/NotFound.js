import _defineProperty from "@babel/runtime-corejs3/helpers/defineProperty";
import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";

var _this = this,
    _jsxFileName = "/home/clement/Project/oa/packages/react-shared/src/components/NotFound.js";

import React from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import { jsx as ___EmotionJSX } from "@emotion/core";

var NotFound = function NotFound(_ref) {
  var staticContext = _ref.staticContext,
      route = _ref.route,
      location = _ref.location;
  var locationState = location.state || {};

  var newLocationState = _objectSpread(_objectSpread({}, locationState), {}, {
    notFound: _objectSpread(_objectSpread({}, locationState.notFound), {}, _defineProperty({}, route.notFoundKey, true))
  });

  if (staticContext) {
    staticContext.status = 404;
  }

  return ___EmotionJSX(Redirect, {
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

NotFound.Capture = withRouter(function (_ref2) {
  var children = _ref2.children,
      location = _ref2.location,
      notFoundKey = _ref2.notFoundKey;
  return location && location.state && location.state.notFound && location.state.notFound[notFoundKey] ? null : children;
});
NotFound.isNotFound = true;
export default NotFound;
//# sourceMappingURL=NotFound.js.map