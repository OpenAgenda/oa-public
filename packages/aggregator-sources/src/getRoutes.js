import loadable from '@openagenda/react-utils/dist/loadable';

const App = loadable(() => import(/* webpackChunkName: "aggSources-App" */ './containers/App'));
const Dashboard = loadable(() => import(
  /* webpackChunkName: "aggSources-Dashboard" */ './containers/Dashboard'
));

export default function (prefix = '') {
  return [
    {
      path: prefix,
      component: App,
      routes: [{ path: `${prefix}/`, exact: true, component: Dashboard }]
    }
  ];
}
