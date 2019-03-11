if ( !window._babelPolyfill ) require( '@babel/polyfill' );

require( 'dom4' );

import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import NProgress from 'nprogress';
import IScroll from 'iscroll';
import du from '@openagenda/dom-utils';
import { loadableReady } from '@loadable/component';
import { HeaderManager, Header } from '@openagenda/react-layouts';
import createAppHome from '@openagenda/home/src/client/app';
import createAppUserSettings from '@openagenda/user-apps/src/app';
import createAgendaSettingsNewApp from '@openagenda/agenda-settings/src/client/createApp';
import NotFoundDisplayer from './NotFoundDisplayer';
import getNotFoundState from './utils/getNotFoundState';
import historyActionMaker from './utils/historyActionMaker';

window.IScroll = IScroll;

const history = createBrowserHistory();
const initialState = window.__data || {};

NProgress.configure( { trickleSpeed: 200 } );

const onLocationChangeStart = () => NProgress.start();
const onLocationChangeFinish = () => NProgress.done();

const sharedAppOptions = { history, onLocationChangeStart, onLocationChangeFinish };

// create apps with the good initialState
const apps = {
  home: createAppHome( {
    initialState: initialState.home,
    // Header: () => <HeaderSelector type="main" />,
    ...sharedAppOptions
  } ),
  userSettings: createAppUserSettings( {
    initialState: initialState.userSettings,
    ...sharedAppOptions
  } ),
  agendaSettingsNew: createAgendaSettingsNewApp( {
    initialState: initialState.agendaSettingsNew,
    ...sharedAppOptions
  } )
};

history.replace( { state: { notFound: getNotFoundState( apps, history.location.pathname ) } } );

history.apps = apps;

const historyActionCreator = historyActionMaker( {
  history,
  apps,
  onLocationChangeStart,
  onLocationChangeFinish
} );

const oldHistoryPush = history.push;
const oldHistoryReplace = history.replace;

history.push = historyActionCreator( oldHistoryPush );
history.replace = historyActionCreator( oldHistoryReplace );

const headerStore = HeaderManager.createStore( initialState.header );

loadableReady( () => {
  const canvas = du.el( '#root' );
  const element = (
    <HeaderManager store={headerStore}>
      <Header history={history} />

      {Object.values( apps ).map( ( { element } ) => element )}

      <NotFoundDisplayer apps={apps} history={history}>
        <div>Not found !</div>
      </NotFoundDisplayer>
    </HeaderManager>
  );

  if ( canvas.hasChildNodes() ) {
    ReactDOM.hydrate( element, canvas );
  } else {
    ReactDOM.render( element, canvas );
  }
} );
