import React from 'react';
import ReactDOM from 'react-dom';
import * as ReactIs from 'react-is';
import { createBrowserHistory } from 'history';
import NProgress from 'nprogress';
import IScroll from 'iscroll';
import { loadableReady } from '@loadable/component';
import du from '@openagenda/dom-utils';
import wrapApp from '@openagenda/react-utils/dist/wrapApp';
import { HeaderManager, Header } from '@openagenda/react-layouts';
import createAppHome from '@openagenda/home/src/client/app';
import createAppUserSettings from '@openagenda/user-apps/src/app';
import createAgendaSettingsNewApp from '@openagenda/agenda-settings/src/client/createApp';
import createActivitiesApp from '@openagenda/activity-apps/src/client/apps/user';
import NotFound from './NotFound';
import NotFoundDisplayer from './NotFoundDisplayer';

window.IScroll = IScroll;

const history = createBrowserHistory();
const initialState = window.__data || {};

NProgress.configure( { trickleSpeed: 200 } );

const onLocationChangeStart = () => NProgress.start();
const onLocationChangeFinish = () => NProgress.done();

// create apps with the good initialState
const apps = {
  home: createAppHome( {
    history,
    // Header: () => <HeaderSelector type="main" />,
    initialState: initialState.home
  } ),
  userSettings: createAppUserSettings( {
    history,
    initialState: initialState.userSettings
  } ),
  agendaSettingsNew: createAgendaSettingsNewApp( {
    history,
    initialState: initialState.agendaSettingsNew
  } ),
  userActivities: createActivitiesApp( {
    history,
    initialState: initialState.userActivities
  } )
};

const headerStore = HeaderManager.createStore( initialState.header );


loadableReady( async () => {
  // Trigger 'inject' before render, needed for the first render (in @connect)
  await Promise.all(
    Object.values( apps ).map( app => app.triggerHooks( { hooks: [ 'inject' ] } ) )
  );

  const triggerHooks = () => Promise.all(
    Object.values( apps ).map( app => app.triggerHooks( {
      onStart: onLocationChangeStart,
      onFinish: onLocationChangeFinish
    } ) )
  );

  const Content = () => (
    <>
      {Object.values( apps )
        .map( ( { Content }, i ) =>
          ReactIs.isValidElementType( Content ) ? <Content key={i} /> : Content
        )}

      <NotFoundDisplayer history={history} apps={apps}>
        <NotFound />
      </NotFoundDisplayer>
    </>
  );

  const element = (
    <HeaderManager store={headerStore}>
      <Header history={history} />

      {wrapApp( { Content, history, triggerHooks } )}
    </HeaderManager>
  );

  const canvas = du.el( '#root' );

  if ( canvas.hasChildNodes() ) {
    ReactDOM.hydrate( element, canvas );
  } else {
    ReactDOM.render( element, canvas );
  }
} );
