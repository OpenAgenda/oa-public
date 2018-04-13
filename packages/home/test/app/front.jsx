import React from 'react';
import ReactDom from 'react-dom';
import du from '@openagenda/dom-utils';
import createApp from '../../react/dist/app';

window.onload = () => {

  const app = createApp( du.parseJsonAttribute( 'body', 'data-options' ) );

  app.match( du.el( '.js_canvas' ) );
  // ReactDom.hydrate( app, du.el( '.js_canvas' ) );

};
