"use strict";

var React = require('react'),
    _require = require('redux-devtools'),
    createDevTools = _require.createDevTools,
    DockMonitor = require('redux-devtools-dock-monitor').default,
    LogMonitor = require('redux-devtools-log-monitor').default;

module.exports = createDevTools(React.createElement(
  DockMonitor,
  { toggleVisibilityKey: 'ctrl-h', changePositionKey: 'ctrl-p', defaultPosition: 'bottom' },
  React.createElement(LogMonitor, null)
));
//# sourceMappingURL=DevTools.js.map