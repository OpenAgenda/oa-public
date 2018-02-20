import React, { Component } from 'react';
import ReactDom from 'react-dom';
import du from '@openagenda/dom-utils';
import dl from '@openagenda/dom-utils/documentLocation';
import adminApp from '../../react/dist/apps/admin';
import agendaApp from '../../react/dist/apps/agenda';
import userApp from '../../react/dist/apps/user';
import notificationsHandler from '../../notifications';

// required also in main.js
window.IScroll = require( 'iscroll/build/iscroll' );

window.onload = () => {

  const renderApp = app => {
    ReactDom.hydrate( app( du.parseJsonAttribute( 'body', 'data-options' ) ), du.el( '.js_canvas' ) );
  }

  switch ( dl.getQueryPart( '_app', 'admin' ) ) {

    case 'agenda':
      return renderApp( agendaApp );
    case 'admin':
      return renderApp( adminApp );
    case 'user':
      return renderApp( userApp );
    case 'notifications':
      ReactDom.hydrate( <div className="container">
        <div className="navbar-collapse collapse">
          <ul className="nav navbar-nav navbar-right">
            <li className="notifications js_notifications hide">
              <a className="js_notifications_opener">
                <i className="fa fa-bell" aria-hidden="true"></i>
                <span className="label label-danger hide"></span>
              </a>
              <div className="js_notifications_panel hide"></div>
            </li>
          </ul>
        </div>
      </div>, du.el( '.js_canvas' ) );

      notificationsHandler();
  }

};
