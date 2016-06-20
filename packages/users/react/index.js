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

  createStore = require( './create' ),

  labels = require( 'labels/users/settings' ),

  getLabels = require( 'labels' )( labels ),

  actions = require( './actions' ),

  RelayContainer = require( './containers/RelayContainer' ),

  App = require( './containers/App' ),

  SettingsContainer = require( './containers/SettingsContainer' );

if ( process.env == 'development' ) {
  const DevTools = require( './containers/DevTools' );
}


require( 'dom-utils/ie8' );

module.exports = function ( options ) {

  const params = utils.extend( {
    canvas: '.js_canvas',
    dataTag: 'data-options',
    lang: 'fr',
    prefix: '',
    urls: {
      getMe: '/getMe',
      updateProfile: '/updateUser',
      changeEmail: '/requestChangeEmail',
      changePassword: '/changePassword',
      deleteAccount: '/deleteAccount',
      uploadProfileImageRes: '/uploadProfileImage',
      removeProfileImageRes: '/removeProfileImage'
    }
  }, options );

  const settings = Object.assign( params, du.parseJsonAttribute( 'body', params.dataTag ) );

  const browserHistory = useRouterHistory( createHistory )( { basename: params.prefix } );
  const store = createStore( browserHistory );
  const history = syncHistoryWithStore( browserHistory, store );

  store.dispatch( actions.setAppSettings( settings ) );

  ReactDom.render(
    <Provider store={store} key="provider">
      <div>
        <Router history={history} createElement={createElement}>
          {routes( store )}
        </Router>
        { !window.devToolsExtension && process.env == 'development' ? <DevTools /> : null }
      </div>
    </Provider>, du.el( params.canvas ) );


  function createElement( Component, props ) {
    return (
      <RelayContainer
        Component={Component}
        store={store}
        routerProps={props}
        getLabels={getLabels}
        lang={params.lang}/>
    );
  }
};