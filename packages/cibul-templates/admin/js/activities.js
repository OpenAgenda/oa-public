import React from 'react';
import ReactDOM from 'react-dom';
import createApp from '@openagenda/activity-apps/dist/client/apps/admin';
import du from '@openagenda/dom-utils';


window.hook( options => {
  const { element } = createApp( options );

  ReactDOM.render( element, du.el( '.js_canvas' ) );
} );
