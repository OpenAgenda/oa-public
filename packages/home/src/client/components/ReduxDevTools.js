import React from 'react';
import { createDevTools, persistState as devToolsPersistState } from 'redux-devtools';
import DockMonitor from 'redux-devtools-dock-monitor';
import Inspector from 'redux-devtools-inspector';


function getDebugSessionKey() {
  // You can write custom logic here!
  // By default we try to read the key from ?debug_session=<key> in the address bar
  const matches = window.location.href.match( /[?&]debug_session=([^&#]+)\b/ );
  return (matches && matches.length > 0) ? matches[ 1 ] : null;
}


export const persistState = devToolsPersistState( getDebugSessionKey() );

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
