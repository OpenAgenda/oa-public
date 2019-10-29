import './polyfill';

// import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { createBrowserHistory } from 'history';
import NProgress from 'nprogress';
import IScroll from 'iscroll';
import { parse } from 'flatted/esm';
import he from 'he';
import { loadableReady } from '@loadable/component';
import du from '@openagenda/dom-utils';
import wrapApp from '@openagenda/react-utils/dist/wrapApp';
import { LayoutManager } from '@openagenda/react-layouts/src';
import createAppHome from '@openagenda/home/src/app';
import createAppUserSettings from '@openagenda/user-apps/src/app';
import createAgendaSettingsNewApp from '@openagenda/agenda-settings/src/client/createApp';
import createActivitiesApp from '@openagenda/activity-apps/src/client/apps/user';
import createAggregatorSourcesApp from '@openagenda/aggregator-sources/src/app';
import ErrorComponent from './ErrorComponent';
import NotFound from './NotFound';
import NotFoundDisplayer from './NotFoundDisplayer';
import RootHelmet from '../RootHelmet';
// import reflectStoresInLayout from '../reflectStoresInLayout';

window.IScroll = IScroll;

const history = createBrowserHistory();

const initialState = parse(he.decode(document.querySelector('#initialState').innerHTML || '{}'));

NProgress.configure({ trickleSpeed: 200 });

const onLocationChangeStart = () => NProgress.start();
const onLocationChangeFinish = () => NProgress.done();

// create apps with the good initialState
const apps = {
  home: createAppHome({
    history,
    initialState: initialState.home,
    layout: 'main'
  }),
  userSettings: createAppUserSettings({
    history,
    initialState: initialState.userSettings,
    layout: 'main'
  }),
  agendaSettingsNew: createAgendaSettingsNewApp({
    history,
    initialState: initialState.agendaSettingsNew,
    layout: 'main'
  }),
  userActivities: createActivitiesApp({
    history,
    initialState: initialState.userActivities,
    layout: 'main'
  }),
  aggregatorSources: createAggregatorSourcesApp({
    history,
    initialState: initialState.aggregatorSources,
    layout: 'agendaAdmin'
  })
};

const layoutStore = LayoutManager.createStore(initialState.layout, history);

loadableReady(async () => {
  // Trigger 'inject' before render, needed for the first render (in @connect)
  await Promise.all(
    Object.values(apps).map(app => app.triggerHooks({ hooks: ['inject'] }))
  );

  // const unsubscribe = reflectStoresInLayout(_.mapValues(apps, 'store'), layoutStore);
  //
  // window.addEventListener('unload', () => unsubscribe);

  const triggerHooks = () => Promise.all(
    Object.values(apps).map(app => app.triggerHooks({
      onStart: onLocationChangeStart,
      onFinish: onLocationChangeFinish
    }))
  );

  const Content = React.memo(() => (
    <LayoutManager store={layoutStore} apps={apps} FallbackComponent={ErrorComponent}>
      <NotFoundDisplayer history={history} apps={apps}>
        <NotFound />
      </NotFoundDisplayer>
    </LayoutManager>
  ));

  const element = (
    <HelmetProvider>
      <RootHelmet />

      {wrapApp({ Content, history, triggerHooks })}
    </HelmetProvider>
  );

  const canvas = du.el('#root');

  if (canvas.hasChildNodes()) {
    ReactDOM.hydrate(element, canvas);
  } else {
    ReactDOM.render(element, canvas);
  }
});
