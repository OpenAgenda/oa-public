import { loadableComponent } from '@openagenda/react-shared';

// eslint-disable-next-line camelcase
const contextRequire = typeof __webpack_require__ !== 'undefined'
  ? import.meta.webpackContext('.', {
    recursive: true,
    regExp: /\.js$/,
    mode: 'weak',
  })
  : null;

const App = loadableComponent({
  chunkName: 'agendaContribute-App',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-App" */
      './containers/App.js'
    ),
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/App.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/App.js');
    }
  },
});

const Member = loadableComponent({
  chunkName: 'agendaContribute-Member',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-Member" */
      './containers/Member.js'
    ),
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/Member.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/Member.js');
    }
  },
});

const MemberSharing = loadableComponent({
  chunkName: 'agendaContribute-MemberSharing',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-MemberSharing" */
      './containers/MemberSharing.js'
    ),
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/MemberSharing.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/MemberSharing.js');
    }
  },
});

const EventNew = loadableComponent({
  chunkName: 'agendaContribute-EventNew',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-EventNew" */
      './containers/EventNew.js'
    ),
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/EventNew.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/EventNew.js');
    }
  },
});

const EventDraft = loadableComponent({
  chunkName: 'agendaContribute-EventDraft',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-EventDraft" */
      './containers/EventDraft.js'
    ),
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/EventDraft.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/EventDraft.js');
    }
  },
});

const EventEdit = loadableComponent({
  chunkName: 'agendaContribute-EventEdit',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-EventEdit" */
      './containers/EventEdit.js'
    ),
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/EventEdit.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/EventEdit.js');
    }
  },
});

const EventShare = loadableComponent({
  chunkName: 'agendaContribute-EventShare',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-EventShare" */
      './containers/EventShare.js'
    ),
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/EventShare.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/EventShare.js');
    }
  },
});

const Confirmation = loadableComponent({
  chunkName: 'agendaContribute-Confirmation',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-Confirmation" */
      './containers/Confirmation.js'
    ),
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/Confirmation.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/Confirmation.js');
    }
  },
});

const EditConfirmation = loadableComponent({
  chunkName: 'agendaContribute-EditConfirmation',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-EditConfirmation" */
      './containers/EditConfirmation.js'
    ),
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/EditConfirmation.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/EditConfirmation.js');
    }
  },
});

const Landing = loadableComponent({
  chunkName: 'agendaContribute-Landing',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-Landing" */
      './containers/Landing.js'
    ),
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/Landing.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/Landing.js');
    }
  },
});

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
