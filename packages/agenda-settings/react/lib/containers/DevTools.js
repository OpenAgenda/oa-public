"use strict";

var React = require('react');

var _require = require('redux-devtools');

var createDevTools = _require.createDevTools;

var DockMonitor = require('redux-devtools-dock-monitor').default;

var LogMonitor = require('redux-devtools-log-monitor').default;

module.exports = createDevTools(React.createElement(
  DockMonitor,
  { toggleVisibilityKey: 'ctrl-h', changePositionKey: 'ctrl-p', defaultPosition: 'bottom' },
  React.createElement(LogMonitor, null)
));