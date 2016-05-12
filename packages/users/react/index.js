"use strict";

const React = require( 'react' ),

  ReactDom = require( 'react-dom' ),

  du = require( 'dom-utils' ),

  utils = require( 'utils' ),

  { Provider } = require( 'react-redux' ),

  { syncHistoryWithStore } = require( 'react-router-redux' ),

  { Router, useRouterHistory } = require( 'react-router' ),

  { createHistory } = require( 'history' ),

  routes = require( './routes' ),

  createStore = require( './store/createStore' ),

  DevTools = require( './containers/DevTools' ),

  App = require( './containers/App' ),

  SettingsContainer = require( './containers/SettingsContainer' );


module.exports = function( options ) {

  var params = utils.extend( {
    canvas: '.js_canvas',
    prefix: '/'
  }, options );

  var browserHistory = useRouterHistory( createHistory )( { basename: params.prefix } ),

    store = createStore( browserHistory, window.env || 'prod' ),

    history = syncHistoryWithStore( browserHistory, store );


  ReactDom.render(
    <Provider store={store} key="provider">
      <div>
        <Router history={history}>
          {routes( store )}
        </Router>
        { !window.devToolsExtension && window.env == 'dev' ? <DevTools /> : null }
      </div>
    </Provider>, du.el( params.canvas ) );
};