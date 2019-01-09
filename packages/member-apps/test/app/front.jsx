import React from 'react';
import ReactDom from 'react-dom';
import du from '@openagenda/dom-utils';
import callToAction from '@openagenda/call-to-action/dist/client';
import app from '../../react/dist/app';

window.onload = () => {

  ReactDom.hydrate( app( du.parseJsonAttribute( 'body', 'data-options' ) ), du.el( '.js_canvas' ) );

  callToAction();

};
