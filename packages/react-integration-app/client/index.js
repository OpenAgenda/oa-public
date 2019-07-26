import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import NProgress from 'nprogress';
import IScroll from 'iscroll';
import { loadableReady } from '@loadable/component';
import du from '@openagenda/dom-utils';
import { matchRoutes } from '@openagenda/react-utils/dist/asyncMatchRoutes';
import ScrollToTop from '@openagenda/react-utils/dist/ScrollToTop';
import RouterTrigger from '@openagenda/react-utils/dist/RouterTrigger';
import { HeaderManager, Header } from '@openagenda/react-layouts';
import createAppHome from '@openagenda/home/src/client/app';
import createAppUserSettings from '@openagenda/user-apps/src/app';
import createAgendaSettingsNewApp from '@openagenda/agenda-settings/src/client/createApp';
import NotFound from './NotFound';
import NotFoundDisplayer from './NotFoundDisplayer';

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

const headerStore = HeaderManager.createStore( initialState.header );


loadableReady( async () => {
  const componentsPerApps = Object.values( apps )
    .map( app =>
      app.routes
      && matchRoutes( app.routes, history.location.pathname ).map( v => v.route.component )
    );

  const { visibleApps /* , notFoundApps */ } = Object.values( apps )
    .reduce( ( result, app, key ) => {
      if ( componentsPerApps[ key ].length ) {
        result.visibleApps.push( app );
      } else {
        result.notFoundApps.push( app );
      }

      return result;
    }, { visibleApps: [], notFoundApps: [] } );

  // Trigger 'inject' before render, needed for the first render (in @connect)
  await Promise.all(
    Object.values( visibleApps ).map( app => app.triggerHooks( { hooks: [ 'inject' ] } ) )
  );

  const triggerHooks = () => Promise.all(
    Object.values( apps ).map( app => app.triggerHooks( {
      onStart: onLocationChangeStart,
      onFinish: onLocationChangeFinish
    } ) )
  );

  const canvas = du.el( '#root' );
  const element = (
    <HeaderManager store={headerStore}>
      <Header history={history} />

      <Router history={history}>
        <ScrollToTop>
          <RouterTrigger trigger={triggerHooks}>
            {Object.values( apps ).map( ( { content } ) => content )}

            <NotFoundDisplayer history={history} apps={apps}>
              <NotFound/>
            </NotFoundDisplayer>
          </RouterTrigger>
        </ScrollToTop>
      </Router>
    </HeaderManager>
  );

  if ( canvas.hasChildNodes() ) {
    ReactDOM.hydrate( element, canvas );
  } else {
    ReactDOM.render( element, canvas );
  }
} );
