import './polyfill';
import { setConfig } from 'react-hot-loader';

setConfig({ trackTailUpdates: false });

// import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import NProgress from 'nprogress';
import IScroll from 'iscroll';
import { parse } from 'flatted/esm';
import he from 'he';
import { loadableReady } from '@loadable/component';
import du from '@openagenda/dom-utils';
import { LayoutManager } from '@openagenda/react-layouts/src';
import MainLayout from '@openagenda/react-layouts/src/layouts/MainLayout';
import AgendaAdminLayout from '@openagenda/react-layouts/src/layouts/AgendaAdminLayout';
import createAppHome from '@openagenda/home/src/app';
import createAppUserSettings from '@openagenda/user-apps/src/app';
import createAgendaSettingsNewApp from '@openagenda/agenda-settings/src/client/createApp';
import createAgendaSettingsEditApp from '@openagenda/agenda-settings/src/client/editApp';
import createActivitiesApp from '@openagenda/activity-apps/src/client/apps/user';
import createAggregatorSourcesApp from '@openagenda/aggregator-sources/src/app';
import Root from './Root';
// import reflectStoresInLayout from '../reflectStoresInLayout';

// if (process.env.NODE_ENV === 'development') {
//   const whyDidYouRender = require('@welldone-software/why-did-you-render');
//   whyDidYouRender(React);
// }

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
    layout: MainLayout
  }),
  userSettings: createAppUserSettings({
    history,
    initialState: initialState.userSettings,
    layout: MainLayout
  }),
  agendaSettingsNew: createAgendaSettingsNewApp({
    history,
    initialState: initialState.agendaSettingsNew,
    layout: MainLayout
  }),
  userActivities: createActivitiesApp({
    history,
    initialState: initialState.userActivities,
    layout: MainLayout
  }),
  aggregatorSources: createAggregatorSourcesApp({
    history,
    initialState: initialState.aggregatorSources,
    layout: AgendaAdminLayout
  }),
  agendaSettingsEdit: createAgendaSettingsEditApp({
    history,
    initialState: initialState.agendaSettingsEdit,
    layout: AgendaAdminLayout
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

  const render = (forceRender = false) => {
    const element = (
      <Root
        apps={apps}
        layoutStore={layoutStore}
        history={history}
        triggerHooks={triggerHooks}
      />
    );
    const canvas = du.el('#root');

    if (!forceRender && canvas.hasChildNodes()) {
      ReactDOM.hydrate(element, canvas);
    } else {
      ReactDOM.render(element, canvas);
    }
  };

  render();

  if (module.hot) {
    module.hot.accept(() => render(true));
  }
});
