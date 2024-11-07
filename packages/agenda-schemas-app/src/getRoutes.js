import { loadable } from '@openagenda/react-shared';

const App = loadable(
  () =>
    import(
      /* webpackChunkName: "legacyEmbeds-App" */
      './containers/App.js'
    ),
);

const Dashboard = loadable(
  () =>
    import(
      /* webpackChunkName: "legacyEmbeds-App" */
      './containers/Dashboard.js'
    ),
);

export default (prefix = '') => [
  {
    path: prefix,
    component: App,
    routes: [
      {
        path: `${prefix}`,
        exact: true,
        component: Dashboard,
      },
      {
        path: `${prefix}/member`,
        exact: true,
        component: Dashboard,
      },
    ],
  },
];
