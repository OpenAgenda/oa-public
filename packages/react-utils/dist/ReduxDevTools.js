'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reduxDevtools = require('redux-devtools');

var _reduxDevtoolsDockMonitor = require('redux-devtools-dock-monitor');

var _reduxDevtoolsDockMonitor2 = _interopRequireDefault(_reduxDevtoolsDockMonitor);

var _reduxDevtoolsInspector = require('redux-devtools-inspector');

var _reduxDevtoolsInspector2 = _interopRequireDefault(_reduxDevtoolsInspector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _reduxDevtools.createDevTools)(_react2.default.createElement(
  _reduxDevtoolsDockMonitor2.default,
  {
    toggleVisibilityKey: 'ctrl-h',
    changePositionKey: 'ctrl-p',
    changeMonitorKey: 'ctrl-m',
    defaultPosition: 'bottom',
    theme: 'nicinabox'
  },
  _react2.default.createElement(_reduxDevtoolsInspector2.default, { theme: 'nicinabox' })
));
module.exports = exports['default'];
//# sourceMappingURL=ReduxDevTools.js.map