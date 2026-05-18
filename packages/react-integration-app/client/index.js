import '@openagenda/polyfills/web.js';
import '@openagenda/polyfills/dom.js';
import '@openagenda/polyfills/intl.js';
import '@openagenda/polyfills/intl-locales.js';

import './sentry.js';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient } from 'react-query';
import { createBrowserHistory } from 'history';
import NProgress from 'nprogress';
import IScroll from 'iscroll';
import { parse } from 'flatted/esm/index.js';
import he from 'he';
import { loadableReady } from '@loadable/component';
import { ErrorBoundary } from '@sentry/react';
import { createLayoutStore } from '@openagenda/react-layouts';
import {
  AgendaAdminDataLayout,
  AgendaDataLayout,
  AgendaAdminFiltersLayout,
  AgendaAdminLayout,
  AgendaLayout,
  InboxUserLayout,
  InboxAgendaAdminLayout,
  MainLayout,
  RequiredSuperAdmin,
  RequiredUser,
} from '@openagenda/react-layouts/layouts';
import createHomeApp from '@openagenda/home';
import createUserSettingsApp from '@openagenda/user-apps';
import createAgendaSettingsNewApp from '@openagenda/agenda-settings/createApp';
import createAgendaSettingsEditApp from '@openagenda/agenda-settings/editApp';
import createUserActivitiesApp from '@openagenda/activity-apps/client/apps/user';
import createAgendaActivitiesApp from '@openagenda/activity-apps/client/apps/agenda';
import createAggregatorSourcesApp from '@openagenda/aggregator-sources';
import createAgendaStatsApp from '@openagenda/agenda-stats';
import createInboxApp from '@openagenda/inbox-apps';
import createMembersApp from '@openagenda/member-apps/app';
import createLegacyEmbedsApp from '@openagenda/legacy/embeds/app';
import createAgendaContributeApp from '@openagenda/agenda-contribute';
import createSupervisorApp from '@openagenda/supervisor';
import createEventAdminApp from '@openagenda/event-admin-apps';
import createAgendaLocationAdminApp from '@openagenda/agenda-locations-app';
import createAgendaSchemaAdminApp from '@openagenda/agenda-schemas-app';
import createReduxMiddleware from '../reduxMiddleware.js';
import RootHelmet from '../RootHelmet.js';
import Root from './Root.js';

// if (process.env.NODE_ENV === 'development') {
//   // eslint-disable-next-line global-require
//   const whyDidYouRender = require('@welldone-software/why-did-you-render');
//   whyDidYouRender(React);
// }

function readyHandler() {
  window.IScroll = IScroll;

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error?.response?.status > 400 && error.response.status < 500) {
            return false;
          }
          return 3;
        },
      },
    },
  });

  window.ReactQueryClientContext = React.createContext(queryClient);

  // queryClient.getQueryCache().subscribe(query => {
  //   console.log('Query:', query);
  // });

  const history = createBrowserHistory();

  const initialState = parse(
    he.decode(document.querySelector('#initialState').innerHTML || '{}'),
  );

  NProgress.configure({ trickleSpeed: 200 });

  const onLocationChangeStart = () => NProgress.start();
  const onLocationChangeFinish = () => NProgress.done();

  const layoutStore = createLayoutStore(initialState.layout, history);

  const reduxMiddleware = createReduxMiddleware(layoutStore, queryClient);

  const apps = [
    ['home', createHomeApp, [MainLayout, RequiredUser]],
    ['userSettings', createUserSettingsApp, [MainLayout, RequiredUser]],
    [
      'agendaSettingsNew',
      createAgendaSettingsNewApp,
      [MainLayout, RequiredUser],
    ],
    ['userActivities', createUserActivitiesApp, [MainLayout, RequiredUser]],
    ['inboxUser', createInboxApp, [MainLayout, RequiredUser, InboxUserLayout]],
    ['support', createInboxApp, [MainLayout, RequiredUser, InboxUserLayout]],
    // agenda admin
    [
      'aggregatorSources',
      createAggregatorSourcesApp,
      [MainLayout, RequiredUser, AgendaAdminDataLayout, AgendaAdminLayout],
    ],
    [
      'agendaAdminInbox',
      createInboxApp,
      [
        MainLayout,
        RequiredUser,
        AgendaAdminDataLayout,
        AgendaAdminLayout,
        InboxAgendaAdminLayout,
      ],
    ],
    [
      'members',
      createMembersApp,
      [MainLayout, RequiredUser, AgendaAdminDataLayout, AgendaAdminLayout],
    ],
    [
      'agendaActivities',
      createAgendaActivitiesApp,
      [MainLayout, RequiredUser, AgendaAdminDataLayout, AgendaAdminLayout],
    ],
    [
      'agendaStats',
      createAgendaStatsApp,
      [
        MainLayout,
        RequiredUser,
        AgendaAdminDataLayout,
        AgendaAdminFiltersLayout,
      ],
    ],
    [
      'legacyEmbeds',
      createLegacyEmbedsApp,
      [
        MainLayout,
        RequiredUser,
        AgendaAdminDataLayout,
        AgendaAdminFiltersLayout,
      ],
    ],
    [
      'agendaContribute',
      createAgendaContributeApp,
      [MainLayout, RequiredUser.agenda, AgendaDataLayout, AgendaLayout],
    ],
    [
      'eventAdmin',
      createEventAdminApp,
      [
        MainLayout,
        RequiredUser,
        AgendaAdminDataLayout,
        AgendaAdminFiltersLayout,
      ],
    ],
    [
      'agendaLocationAdmin',
      createAgendaLocationAdminApp,
      [MainLayout, RequiredUser, AgendaAdminDataLayout, AgendaAdminLayout],
    ],
    [
      'agendaSchemaAdmin',
      createAgendaSchemaAdminApp,
      [
        MainLayout,
        RequiredUser,
        AgendaAdminDataLayout,
        AgendaAdminFiltersLayout,
      ],
    ],
    [
      'agendaSettingsEdit',
      createAgendaSettingsEditApp,
      [MainLayout, RequiredUser, AgendaAdminDataLayout, AgendaAdminLayout],
    ],
    // superadmin
    [
      'adminSupport',
      createInboxApp,
      [MainLayout, RequiredUser, RequiredSuperAdmin, InboxUserLayout],
    ],
    [
      'supervisor',
      createSupervisorApp,
      [MainLayout, RequiredUser, RequiredSuperAdmin],
    ],
  ].reduce(
    (accu, [key, createApp, layout]) => ({
      ...accu,
      [key]: createApp({
        initialState: initialState[key],
        layout,
        history,
        reduxMiddleware,
      }),
    }),
    {},
  );

  // function QueryWatch() {
  //   const client = useQueryClient();
  //   const queryCache = client.getQueryCache();
  //
  //   // TODO if agenda modified THEN refetch layout data
  //
  //   return null;
  // }

  loadableReady(async () => {
    // Trigger 'inject' before render, needed for the first render (in @connect)
    await Promise.all(
      Object.values(apps).map((app) => app.triggerHooks({ hooks: ['inject'] })),
    );

    const triggerHooks = () =>
      Promise.all(
        Object.values(apps).map((app) =>
          app.triggerHooks({
            onStart: onLocationChangeStart,
            onFinish: onLocationChangeFinish,
          })),
      );

    const render = (forceRender = false) => {
      const element = (
        <ErrorBoundary>
          <Root
            apps={apps}
            layoutStore={layoutStore}
            history={history}
            triggerHooks={triggerHooks}
            queryClient={queryClient}
          >
            <RootHelmet />

            {/* <QueryWatch /> */}
          </Root>
        </ErrorBoundary>
      );
      const canvas = document.querySelector('#root');

      if (!forceRender && canvas.hasChildNodes()) {
        ReactDOM.hydrateRoot(canvas, element);
      } else {
        const root = ReactDOM.createRoot(canvas);
        root.render(element);
      }
    };

    render();

    if (import.meta.webpackHot) {
      import.meta.webpackHot.accept(() => render(true));
    }
  });
}

if (
  document.readyState === 'complete'
  || document.readyState === 'interactive'
) {
  readyHandler();
} else {
  window.addEventListener('DOMContentLoaded', readyHandler);
}
