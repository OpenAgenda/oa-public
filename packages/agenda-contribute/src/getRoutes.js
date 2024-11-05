import { loadable } from '@openagenda/react-shared';

const App = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaContribute-App" */
      './containers/App.js'
    ),
);

const Member = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaContribute-Member" */
      './containers/Member.js'
    ),
);

const MemberSharing = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaContribute-MemberSharing" */
      './containers/MemberSharing.js'
    ),
);

const EventNew = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaContribute-EventNew" */
      './containers/EventNew.js'
    ),
);

const EventDraft = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaContribute-EventDraft" */
      './containers/EventDraft.js'
    ),
);

const EventEdit = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaContribute-EventEdit" */
      './containers/EventEdit.js'
    ),
);

const EventShare = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaContribute-EventShare" */
      './containers/EventShare.js'
    ),
);

const Confirmation = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaContribute-Confirmation" */
      './containers/Confirmation.js'
    ),
);

const EditConfirmation = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaContribute-EditConfirmation" */
      './containers/EditConfirmation.js'
    ),
);

const Landing = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaContribute-Landing" */
      './containers/Landing.js'
    ),
);

export default (prefix = '') => [
  {
    path: prefix,
    component: App,
    routes: [
      {
        path: `${prefix}/`,
        component: Landing,
        exact: true,
      },
      {
        path: `${prefix}/member`,
        component: Member,
      },
      {
        path: `${prefix}/event`,
        component: EventNew,
        exact: true,
      },
      {
        path: `${prefix}/event/:eventUid`,
        component: EventEdit,
        exact: true,
      },
      {
        path: `${prefix}/event/:eventUid/confirmation`,
        component: EditConfirmation,
      },
      {
        path: `${prefix}/event/:eventUid/draft`,
        component: EventDraft,
      },
      {
        path: `${prefix}/confirmation`,
        component: Confirmation,
      },
      {
        path: `${prefix}/event/:eventUid/from/:fromAgendaUid`,
        component: EventShare,
        exact: true,
      },
      {
        path: `${prefix}/event/:eventUid/from/:fromAgendaUid/member`,
        component: MemberSharing,
      },
    ],
  },
];
