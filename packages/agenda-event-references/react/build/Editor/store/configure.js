"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _redux = require("redux");

var _reducers = _interopRequireDefault(require("../reducers"));

var _reduxThunk = _interopRequireDefault(require("redux-thunk"));

var _default = (0, _redux.compose)((0, _redux.applyMiddleware)(_reduxThunk.default));

exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=configure.js.map