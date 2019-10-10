import React from 'react';
import ReactDOM from 'react-dom';
import createApp from '@openagenda/aggregator-sources/dist/client/app';
import wrapApp from '@openagenda/react-utils/dist/wrapApp';
import du from '@openagenda/dom-utils';


window.hook( options => {
  ReactDOM.render( wrapApp( createApp( options ) ), du.el( '.js_canvas' ) );
} );
