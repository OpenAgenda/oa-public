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
  /* webpackChunkName: "agendaContribute-EventNew" */
  './containers/EventNew'
));

const EventEdit = loadable(() => import(
  /* webpackChunkName: "agendaContribute-EventEdit" */
  './containers/EventEdit'
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
    }, {
      path: `${prefix}/event/:eventUid`,
      component: EventEdit,
      exact: true
    }]
  }
]);
