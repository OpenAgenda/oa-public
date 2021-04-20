"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = useApiClient;

var _react = require("react");

var _ApiClientContext = _interopRequireDefault(require("../contexts/ApiClientContext"));

function useApiClient() {
  return (0, _react.useContext)(_ApiClientContext.default);
}

module.exports = exports.default;
//# sourceMappingURL=useApiClient.js.map