import React, { Component } from 'react';
import ReactDom from 'react-dom';
import du from '@openagenda/dom-utils';
import app from '../../react/dist/app';

window.onload = () => {

  ReactDom.render( app( du.parseJsonAttribute( 'body', 'data-options' ) ), du.el( '.js_canvas' ) );

};
