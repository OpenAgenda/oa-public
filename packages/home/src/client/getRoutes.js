import NotFound from '@openagenda/react-utils/dist/NotFound';
import loadable from './loadable';

const App = loadable( () => import( /* webpackChunkName: "home-App" */ './containers/App' ) );
const Agendas = loadable( () => import( /* webpackChunkName: "home-Agendas" */ './containers/Agendas' ) );
const Events = loadable( () => import( /* webpackChunkName: "home-Events" */ './containers/Events'  ) );

export default function ( prefix = '', notFoundKey = 'home' ) {
  return [
    {
      component: App,
      routes: [
        { path: `${prefix}/`, exact: true, component: Agendas },
        { path: `${prefix}/events`, component: Events },
        { component: NotFound, notFoundKey }
      ]
    }
  ];
};
