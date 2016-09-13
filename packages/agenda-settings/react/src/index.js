import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import du from 'dom-utils';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import { Router, useRouterHistory } from 'react-router';
import { createHistory } from 'history';
import routes from './routes';
import createStore from './redux/create';
import ApiClient from './helpers/ApiClient';
import labels from 'labels/agenda-settings/agendaCreation';
import makeLabelGetter from 'labels';
// import actions from './actions';
import { DevTools, RelayContainer } from './containers';

require( 'dom-utils/ie8' );
require( 'dom-utils/ie9' );

module.exports = options => {

  const params = Object.assign( {
    canvas: '.js_canvas',
    lang: 'fr',
    prefix: ''
  }, options );


  const client = new ApiClient();
  const browserHistory = useRouterHistory( createHistory )( { basename: params.prefix } );
  const store = createStore( browserHistory, client );
  const history = syncHistoryWithStore( browserHistory, store );

  // const settings = Object.assign( params, du.parseJsonAttribute( 'body', params.dataTag ) );
  // store.dispatch( actions.setAppSettings( settings ) );

  const createElement = ( component, props ) =>
    <RelayContainer
      component={component}
      routerProps={props}
      getLabel={makeLabelGetter(labels)}
      lang={params.lang} />;

  ReactDom.render(
    <Provider store={store} key="provider">
      <div>
        <Router history={history} createElement={createElement}>
          {routes( store )}
        </Router> {process.env.NODE_ENV == 'development' && !window.devToolsExtension ? <DevTools /> : null}
      </div>
    </Provider>, du.el( params.canvas ) );

};
