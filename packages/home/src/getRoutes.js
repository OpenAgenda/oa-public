import { loadable } from '@openagenda/react-shared';

const App = loadable(() =>
  import(/* webpackChunkName: "home-App" */ './containers/App'));
const Agendas = loadable(() =>
  import(/* webpackChunkName: "home-Agendas" */ './containers/Agendas'));
const Events = loadable(() =>
  import(/* webpackChunkName: "home-Events" */ './containers/Events'));

export default function getRootes(prefix = '', rootPrefix = prefix) {
  return [
    {
      path: rootPrefix,
      exact: true,
      component: App,
      routes: [
        { path: `${prefix}/`, exact: true, component: Agendas },
        { path: `${prefix}/events`, component: Events },
        { path: `${prefix}/agendas/member`, component: Agendas },
      ],
    },
  ];
}
