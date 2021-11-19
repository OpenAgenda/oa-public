import {
  loadable
} from '@openagenda/react-shared';

const App = loadable(() => import(
  /* webpackChunkName: "agendaContribute-App" */
  './containers/App'
));

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

const Confirmation = loadable(() => import(
  /* webpackChunkName: "agendaContribute-Confirmation" */
  './containers/Confirmation'
));

export default (prefix = '') => ([
  {
    path: prefix,
    component: App,
    routes: [{
      path: `${prefix}/member`,
      component: Member,
      exact: true
    }, {
      path: `${prefix}/event`,
      component: EventNew,
      exact: true
    }, {
      path: `${prefix}/event/:eventUid`,
      component: EventEdit,
      exact: true
    }, {
      path: `${prefix}/confirmation`,
      component: Confirmation,
      exact: true
    }]
  }
]);
