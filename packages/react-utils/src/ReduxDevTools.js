import React from 'react';
import { createDevTools } from 'redux-devtools';
import DockMonitor from 'redux-devtools-dock-monitor';
import Inspector from 'redux-devtools-inspector';


export default createDevTools(
  <DockMonitor
    toggleVisibilityKey="ctrl-h"
    changePositionKey="ctrl-p"
    changeMonitorKey="ctrl-m"
    defaultPosition="bottom"
    theme="nicinabox"
  >
    <Inspector theme="nicinabox" />
  </DockMonitor>
);