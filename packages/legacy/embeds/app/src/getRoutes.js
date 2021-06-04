import {
  loadable
} from '@openagenda/react-shared';

const App = loadable(() => import(
  /* webpackChunkName: "legacyEmbeds-App" */
  './containers/App'
));

const DashboardWrapper = loadable(() => import(
  /* webpackChunkName: "legacyEmbeds-DashboardWrapper" */
  './containers/DashboardWrapper'
));

export default (prefix = '') => ([
  {
    path: prefix,
    component: App,
    routes: [{
      exact: true,
      path: `${prefix}`,
      component: DashboardWrapper
    }]
  }
]);
