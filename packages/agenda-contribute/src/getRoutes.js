import loadableEsm from '@openagenda/react-shared/utils/loadableEsm';

// eslint-disable-next-line camelcase
const contextRequire = typeof __webpack_require__ !== 'undefined'
  ? import.meta.webpackContext
      && import.meta.webpackContext('.', {
        recursive: true,
        regExp: /\.js$/,
        mode: 'weak',
      })
  : null;

const App = loadableEsm({
  chunkName: 'agendaContribute-App',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-App" */
      './containers/App.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/App.js')
      : null,
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

const Member = loadableEsm({
  chunkName: 'agendaContribute-Member',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-Member" */
      './containers/Member.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/Member.js')
      : null,
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

const MemberSharing = loadableEsm({
  chunkName: 'agendaContribute-MemberSharing',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-MemberSharing" */
      './containers/MemberSharing.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/MemberSharing.js')
      : null,
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

const EventNew = loadableEsm({
  chunkName: 'agendaContribute-EventNew',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-EventNew" */
      './containers/EventNew.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/EventNew.js')
      : null,
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

const EventDraft = loadableEsm({
  chunkName: 'agendaContribute-EventDraft',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-EventDraft" */
      './containers/EventDraft.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/EventDraft.js')
      : null,
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

const EventEdit = loadableEsm({
  chunkName: 'agendaContribute-EventEdit',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-EventEdit" */
      './containers/EventEdit.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/EventEdit.js')
      : null,
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

const EventShare = loadableEsm({
  chunkName: 'agendaContribute-EventShare',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-EventShare" */
      './containers/EventShare.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/EventShare.js')
      : null,
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

const Confirmation = loadableEsm({
  chunkName: 'agendaContribute-Confirmation',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-Confirmation" */
      './containers/Confirmation.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/Confirmation.js')
      : null,
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

const EditConfirmation = loadableEsm({
  chunkName: 'agendaContribute-EditConfirmation',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-EditConfirmation" */
      './containers/EditConfirmation.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/EditConfirmation.js')
      : null,
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

const Landing = loadableEsm({
  chunkName: 'agendaContribute-Landing',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaContribute-Landing" */
      './containers/Landing.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/Landing.js')
      : null,
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
