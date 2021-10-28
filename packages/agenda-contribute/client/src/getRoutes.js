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

// const Temporary = loadable(() => import(
//   /* webpackChunkName: "agendaContribute-Temporary" */
//   './containers/Temporary'
// ));

const Member = loadable(() => import(
  /* webpackChunkName: "agendaContribute-Member" */
  './containers/Member'
));

const EventNew = loadable(() => import(
  /* webpackChunkName: "agendaContribute-Member" */
  './containers/EventNew'
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
      path: `${prefix}/member`,
      component: Member
    }, {
      path: `${prefix}/event`,
      component: EventNew,
      exact: true
    }]
  }
]);
