"use strict";

const React = require( 'react' );
const ReactDom = require( 'react-dom' );
const du = require( '@openagenda/dom-utils' );
const utils = require( '@openagenda/utils' );
const { Provider } = require( 'react-redux' );
const { syncHistoryWithStore } = require( 'react-router-redux' );
const { Router, useRouterHistory } = require( 'react-router' );
const { createHistory } = require( 'history' );
const routes = require( './routes' );
const createStore = require( './create' );
const labels = require( '@openagenda/labels/users/settings' );
const getLabels = require( '@openagenda/labels' )( labels );
const actions = require( './actions' );
const RelayContainer = require( './containers/RelayContainer' );
const App = require( './containers/App' );
const SettingsContainer = require( './containers/SettingsContainer' );
const DevTools = require( './containers/DevTools' );


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
      generateApiKey: '/generateApiKey',
      deleteAccount: '/deleteAccount',
      uploadProfileImageRes: '/uploadProfileImage',
      removeProfileImageRes: '/removeProfileImage',
      listUnsubscriptions: '/u/:userUid/list',
      removeUnsubscription: '/u/:userUid/s/:subject.:identifier/t/:type/remove'
    }
  }, options );

  const settings = Object.assign( params, du.parseJsonAttribute( 'body', params.dataTag ) );

  const browserHistory = useRouterHistory( createHistory )(/* { basename: params.prefix } */);
  const store = createStore( browserHistory );
  const history = syncHistoryWithStore( browserHistory, store );

  store.dispatch( actions.setAppSettings( settings ) );

  ReactDom.hydrate(
    <Provider store={store} key="provider">
      <div>
        <Router history={history} createElement={createElement}>
          {routes( store )}
        </Router>
        {process.env.NODE_ENV == 'develoment' && !window.devToolsExtension ? <DevTools /> : null}
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