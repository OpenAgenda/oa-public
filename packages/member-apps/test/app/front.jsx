import React, { Component } from 'react';
import ReactDom from 'react-dom';
import du from '@openagenda/dom-utils';
import callToAction from '@openagenda/call-to-action/react/dist';
import app from '../../react/dist/app';

window.onload = () => {

  ReactDom.hydrate( app( du.parseJsonAttribute( 'body', 'data-options' ) ), du.el( '.js_canvas' ) );

  callToAction();

};
