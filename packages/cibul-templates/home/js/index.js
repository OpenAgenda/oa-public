import React from 'react';
import ReactDOM from 'react-dom';
import createApp from '@openagenda/home/dist/client/app';
import du from '@openagenda/dom-utils';

window.hook( options => {
  const { element, triggerHooks } = createApp( options );

  triggerHooks();

  ReactDOM.render( element, du.el( '.js_canvas' ) );
} );
