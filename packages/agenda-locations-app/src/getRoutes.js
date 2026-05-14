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
  chunkName: 'agendaLocations-App',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaLocations-App" */
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

const Temporary = loadableEsm({
  chunkName: 'agendaLocations-Temporary',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaLocations-Temporary" */
      './containers/Temporary.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/Temporary.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/Temporary.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/Temporary.js');
    }
  },
});

const Dashboard = loadableEsm({
  chunkName: 'agendaLocations-Dashboard',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaLocations-Dashboard" */
      './containers/Dashboard.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/Dashboard.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/Dashboard.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/Dashboard.js');
    }
  },
});

const CreateForm = loadableEsm({
  chunkName: 'agendaLocations-CreateForm',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaLocations-CreateForm" */
      './containers/CreateForm.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/CreateForm.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/CreateForm.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/CreateForm.js');
    }
  },
});

const UpdateForm = loadableEsm({
  chunkName: 'agendaLocations-UpdateForm',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaLocations-UpdateForm" */
      './containers/UpdateForm.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/UpdateForm.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/UpdateForm.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/UpdateForm.js');
    }
  },
});

export default (prefix = '') => [
  {
    path: prefix,
    component: App,
    routes: [
      {
        path: `${prefix}/create`,
        exact: true,
        component: CreateForm,
      },
      {
        path: `${prefix}`,
        exact: true,
        component: Dashboard,
      },
      {
        path: `${prefix}/merge`,
        exact: true,
        component: Dashboard,
      },
      {
        path: `${prefix}/tmp`,
        exact: true,
        component: Temporary,
      },
      {
        path: `${prefix}/:locationUid`,
        exact: true,
        component: Dashboard, // with detailed modal open
      },
      {
        path: `${prefix}/:locationUid/edit`,
        exact: true,
        component: UpdateForm,
      },
    ],
  },
];
