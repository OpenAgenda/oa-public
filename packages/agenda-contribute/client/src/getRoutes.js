import {
  loadable
} from '@openagenda/react-shared';

const App = loadable(() => import(
  /* webpackChunkName: "agendaContribute-App" */
  './containers/App'
));

const Landing = loadable(() => import(
  /* webpackChunkName: "agendaContribute-Landing" */
  './containers/Landing'
));

export default (prefix = '') => ([
  {
    path: prefix,
    component: App,
    routes: [{
      path: `${prefix}`,
      exact: true,
      component: Landing
    }, {
      path: `${prefix}/event/:eventUid`,
      component: Landing
    }]
  }
]);
