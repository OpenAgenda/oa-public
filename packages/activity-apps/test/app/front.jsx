import React, { Component } from 'react';
import ReactDom from 'react-dom';
import du from 'dom-utils';
import dl from 'dom-utils/documentLocation';
import adminApp from '../../react/dist/apps/admin';
import agendaApp from '../../react/dist/apps/agenda';

window.onload = () => {

  const renderApp = app => {
    ReactDom.render( app( du.parseJsonAttribute( 'body', 'data-options' ) ), du.el( '.js_canvas' ) );
  }

  switch ( dl.getQueryPart( '_app', 'admin' ) ) {

    case 'agenda':
      return renderApp( agendaApp );
    case 'admin':
      return renderApp( adminApp );

  }

};
