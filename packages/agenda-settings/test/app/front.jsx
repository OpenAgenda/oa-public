import React from 'react';
import ReactDom from 'react-dom';
import du from '@openagenda/dom-utils';
import dl from '@openagenda/dom-utils/documentLocation';
import callToAction from '@openagenda/call-to-action/dist/client';
import createApp from '../../src/react/createApp';
import editApp from '../../src/react/editApp';

window.onload = () => {

  const options = du.parseJsonAttribute( 'body', 'data-options' );
  const typeApp = dl.getQueryPart( '_app', 'creation' );

  const app = typeApp == 'edition' && editApp( { state: options.state } ) || createApp( { state: options.state } );

  ReactDom.render( app, du.el( '.js_canvas' ) );

  callToAction();

};
