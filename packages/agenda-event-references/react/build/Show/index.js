'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _show = require('./reducers/show');

var _show2 = _interopRequireDefault(_show);

var _Show = require('./components/Show');

var _Show2 = _interopRequireDefault(_Show);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (options) {
  return _react2.default.createElement(
    _reactRedux.Provider,
    { store: (0, _redux.createStore)(_show2.default) },
    _react2.default.createElement(_Show2.default, null)
  );
};

module.exports = exports['default'];