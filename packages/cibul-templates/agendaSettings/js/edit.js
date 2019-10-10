import React from 'react';
import ReactDOM from 'react-dom';
import createApp from '@openagenda/agenda-settings/dist/client/editApp';
import wrapApp from '@openagenda/react-utils/dist/wrapApp';
import du from '@openagenda/dom-utils';


window.hook( options => {
  ReactDOM.render( wrapApp( createApp( options ) ), du.el( '.js_canvas' ) );
} );
