import React from 'react';
import ReactDOM from 'react-dom';
import du from '@openagenda/dom-utils';
import createApp from "@openagenda/member-apps/dist/app";


window.hook( options => {
  const { element } = createApp( options );

  ReactDOM.render( element, du.el( '.js_canvas' ) );
} );
