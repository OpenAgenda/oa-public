"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _EventItem = require('./EventItem');

var _EventItem2 = _interopRequireDefault(_EventItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

var Show = function Show(_ref) {
  _objectDestructuringEmpty(_ref);

  return _react2.default.createElement(
    'div',
    { className: 'content event-references' },
    _react2.default.createElement(
      'h3',
      null,
      'Voir Aussi'
    ),
    _react2.default.createElement(_EventItem2.default, null)
  );
};

Show.propTypes = {};

exports.default = Show;
module.exports = exports['default'];