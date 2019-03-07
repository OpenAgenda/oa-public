import React from 'react';
import ReactDOM from 'react-dom';
import createApp from '@openagenda/agenda-settings/dist/client/createApp';
import du from '@openagenda/dom-utils';


window.hook( options => {
  const { element } = createApp( options );

  ReactDOM.render( element, du.el( '.js_canvas' ) );
} );
