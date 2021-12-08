import {
  loadable
} from '@openagenda/react-shared';

const App = loadable(() => import(
  /* webpackChunkName: "legacyEmbeds-App" */
  './containers/App'
));

const Temporary = loadable(() => import(
  /* webpackChunkName: "legacyEmbeds-Temporary" */
  './containers/Temporary'
));

const Dashboard = loadable(() => import(
  /* webpackChunkName: "legacyEmbeds-Dashboard" */
  './containers/Dashboard'
));

const CreateForm = loadable(() => import(
  /* webpackChunkName: "legacyEmbeds-CreateForm" */
  './containers/CreateForm'
));

export default (prefix = '') => ([
  {
    path: prefix,
    component: App,
    routes: [{
      path: `${prefix}`,
      exact: true,
      component: Dashboard
    },
    {
      path: `${prefix}/p/:page`,
      exact: true,
      component: Dashboard
    },
    {
      path: `${prefix}/:locationUid`,
      exact: true,
      component: Dashboard // with detailed modal open
    },
    {
      path: `${prefix}/create`,
      exact: true,
      component: CreateForm
    },
/*   {
      path: `${prefix}/:locationUid/edit`,
      exact: true,
      component: UpdateForm
    }, */
    {
      path: `${prefix}/tmp`,
      exact: true,
      component: Temporary
    }]
  }
]);
