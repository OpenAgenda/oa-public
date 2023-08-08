import { loadable } from '@openagenda/react-shared';

const App = loadable(() =>
  import(/* webpackChunkName: "members-App" */ './containers/App/App'));
const Dashboard = loadable(() =>
  import(
    /* webpackChunkName: "members-Dashboard" */ './containers/Dashboard/Dashboard'
  ));

export default function getRoutes(prefix = '') {
  return [
    {
      path: prefix,
      component: App,
      routes: [{ path: `${prefix}/`, exact: true, component: Dashboard }],
    },
  ];
}
