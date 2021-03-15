import { loadable } from '@openagenda/react-shared';

const App = loadable(() => import(/* webpackChunkName: "agendaStats-App" */ './containers/App'));
const Dashboard = loadable(() => import(
  /* webpackChunkName: "agendaStats-Dashboard" */ './containers/Dashboard'
));

export default function (prefix = '') {
  return [
    {
      path: prefix,
      component: App,
      routes: [{ path: `${prefix}/`, exact: true, component: Dashboard }],
    },
  ];
}
