import React, { Component } from 'react';
import ReactDom from 'react-dom';
import du from 'dom-utils';
import dl from 'dom-utils/documentLocation';
import createApp from '../../react/src/createApp';
import editApp from '../../react/src/editApp';

window.onload = () => {

  const options = du.parseJsonAttribute( 'body', 'data-options' );
  const typeApp = dl.getQueryPart( '_app', 'creation' );

  const app = typeApp == 'edition' && editApp( { state: options.state } ) || createApp( { state: options.state } );

  ReactDom.render( app, du.el( '.js_canvas' ) );

};
