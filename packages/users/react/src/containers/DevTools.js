"use strict";

const React = require( 'react' ),

  { createDevTools } = require( 'redux-devtools' ),

  DockMonitor = require( 'redux-devtools-dock-monitor' ).default,

  LogMonitor = require( 'redux-devtools-log-monitor' ).default;


module.exports = createDevTools(
  <DockMonitor toggleVisibilityKey="ctrl-h" changePositionKey="ctrl-p" defaultPosition="bottom">
    <LogMonitor />
  </DockMonitor>
);