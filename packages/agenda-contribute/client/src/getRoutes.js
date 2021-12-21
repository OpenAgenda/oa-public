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

const EventDraft = loadable(() => import(
  /* webpackChunkName: "agendaContribute-EventDraft" */
  './containers/EventDraft'
));

const EventEdit = loadable(() => import(
  /* webpackChunkName: "agendaContribute-EventEdit" */
  './containers/EventEdit'
));

const EventShare = loadable(() => import(
  /* webpackChunkName: "agendaContribute-EventShare" */
  './containers/EventShare'
));

const Confirmation = loadable(() => import(
  /* webpackChunkName: "agendaContribute-Confirmation" */
  './containers/Confirmation'
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
      path: `${prefix}/`,
      component: Landing,
      exact: true
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
    }, {
      path: `${prefix}/event/:eventUid/draft`,
      component: EventDraft
    }, {
      path: `${prefix}/confirmation`,
      component: Confirmation
    }, {
      path: `${prefix}/event/:eventUid/from/:fromAgendaUid`,
      component: EventShare
    }]
  }
]);
