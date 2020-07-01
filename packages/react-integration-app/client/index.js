import '@openagenda/polyfills/web';
import '@openagenda/polyfills/dom';
import '@openagenda/polyfills/intl';

import * as RHL from 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import NProgress from 'nprogress';
import IScroll from 'iscroll';
import { parse } from 'flatted/esm';
import he from 'he';
import { loadableReady } from '@loadable/component';
import { createLayoutStore } from '@openagenda/react-layouts/src';
import {
  AgendaAdminLayout,
  InboxUserLayout,
  InboxAgendaAdminLayout,
  MainLayout,
  RequiredSuperAdmin,
  RequiredUser
} from '@openagenda/react-layouts/src/layouts';
import createHomeApp from '@openagenda/home/src/app';
import createUserSettingsApp from '@openagenda/user-apps/src/app';
import createAgendaSettingsNewApp from '@openagenda/agenda-settings/src/client/createApp';
import createAgendaSettingsEditApp from '@openagenda/agenda-settings/src/client/editApp';
import createUserActivitiesApp from '@openagenda/activity-apps/src/client/apps/user';
import createAgendaActivitiesApp from '@openagenda/activity-apps/src/client/apps/agenda';
import createAggregatorSourcesApp from '@openagenda/aggregator-sources/src/app';
import createAgendaStatsApp from '@openagenda/agenda-stats/src/app';
import createInboxApp from '@openagenda/inbox-apps/src/apps/inbox';
import createMembersApp from '@openagenda/member-apps/src/app';
import createSupervisorApp from '@openagenda/supervisor/src/app';
import createReduxMiddleware from '../reduxMiddleware';
import Root from './Root';

if (!module.hot) {
  RHL.AppContainer.warnAboutHMRDisabled = false;
  RHL.hot.shouldWrapWithAppContainer = false;
}

RHL.setConfig({ trackTailUpdates: false });

// if (process.env.NODE_ENV === 'development') {
//   // eslint-disable-next-line global-require
//   const whyDidYouRender = require('@welldone-software/why-did-you-render');
//   whyDidYouRender(React);
// }

window.IScroll = IScroll;

const history = createBrowserHistory();

const initialState = parse(
  he.decode(document.querySelector('#initialState').innerHTML || '{}')
);

NProgress.configure({ trickleSpeed: 200 });

const onLocationChangeStart = () => NProgress.start();
const onLocationChangeFinish = () => NProgress.done();

const layoutStore = createLayoutStore(initialState.layout, history);

const reduxMiddleware = createReduxMiddleware(layoutStore);

const apps = [
  ['home', createHomeApp, MainLayout],
  ['userSettings', createUserSettingsApp, [MainLayout, RequiredUser]],
  ['agendaSettingsNew', createAgendaSettingsNewApp, [MainLayout, RequiredUser]],
  ['userActivities', createUserActivitiesApp, [MainLayout, RequiredUser]],
  [
    'aggregatorSources',
    createAggregatorSourcesApp,
    [MainLayout, RequiredUser, AgendaAdminLayout]
  ],
  [
    'agendaSettingsEdit',
    createAgendaSettingsEditApp,
    [MainLayout, RequiredUser, AgendaAdminLayout]
  ],
  ['inboxUser', createInboxApp, [MainLayout, RequiredUser, InboxUserLayout]],
  ['support', createInboxApp, [MainLayout, RequiredUser, InboxUserLayout]],
  [
    'agendaAdminInbox',
    createInboxApp,
    [MainLayout, RequiredUser, AgendaAdminLayout, InboxAgendaAdminLayout]
  ],
  ['members', createMembersApp, [MainLayout, RequiredUser, AgendaAdminLayout]],
  [
    'agendaActivities',
    createAgendaActivitiesApp,
    [MainLayout, RequiredUser, AgendaAdminLayout]
  ],
  [
    'agendaStats',
    createAgendaStatsApp,
    [MainLayout, RequiredUser, AgendaAdminLayout]
  ],
  [
    'adminSupport',
    createInboxApp,
    [MainLayout, RequiredUser, RequiredSuperAdmin, InboxUserLayout]
  ],
  [
    'supervisor',
    createSupervisorApp,
    [MainLayout, RequiredUser, RequiredSuperAdmin]
  ]
].reduce(
  (accu, [key, createApp, layout]) => ({
    ...accu,
    [key]: createApp({
      initialState: initialState[key],
      layout,
      history,
      reduxMiddleware
    })
  }),
  {}
);

loadableReady(async () => {
  // Trigger 'inject' before render, needed for the first render (in @connect)
  await Promise.all(
    Object.values(apps).map(app => app.triggerHooks({ hooks: ['inject'] }))
  );

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
    const canvas = document.querySelector('#root');

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
