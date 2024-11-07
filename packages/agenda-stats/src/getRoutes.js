import { loadable } from '@openagenda/react-shared';

const App = loadable(
  () => import(/* webpackChunkName: "agendaStats-App" */ './containers/App.js'),
);
const Dashboard = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaStats-Dashboard" */ './containers/Dashboard.js'
    ),
);

export default (prefix = '') => [
  {
    path: prefix,
    component: App,
    routes: [{ path: `${prefix}/`, exact: true, component: Dashboard }],
  },
];
