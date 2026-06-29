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
  chunkName: 'supervisor-App',
  importAsync: () =>
    import(
      /* webpackChunkName: "supervisor-App" */
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

const Dashboard = loadableEsm(
  {
    chunkName: 'supervisor-Dashboard',
    importAsync: () =>
      import(
        /* webpackChunkName: "supervisor-Dashboard" */
        './containers/Dashboard.js'
      ),
    // importSync:
    //   // eslint-disable-next-line camelcase
    //   typeof __webpack_require__ === 'undefined'
    //     ? await import('./containers/Dashboard.js')
    //     : null,
    resolve: () => {
      if (contextRequire) {
        return contextRequire.resolve('./containers/Dashboard.js');
      }
      const { resolve } = import.meta;
      if (typeof resolve === 'function') {
        return resolve('./containers/Dashboard.js');
      }
    },
  },
  { ssr: false },
);

const AnnouncementManager = loadableEsm(
  {
    chunkName: 'supervisor-AnnouncementManager',
    importAsync: () =>
      import(
        /* webpackChunkName: "supervisor-AnnouncementManager" */
        './containers/AnnouncementManager.js'
      ),
    // importSync:
    //   // eslint-disable-next-line camelcase
    //   typeof __webpack_require__ === 'undefined'
    //     ? await import('./containers/AnnouncementManager.js')
    //     : null,
    resolve: () => {
      if (contextRequire) {
        return contextRequire.resolve('./containers/AnnouncementManager.js');
      }
      const { resolve } = import.meta;
      if (typeof resolve === 'function') {
        return resolve('./containers/AnnouncementManager.js');
      }
    },
  },
  { ssr: false },
);

const Elasticsearch = loadableEsm(
  {
    chunkName: 'supervisor-Elasticsearch',
    importAsync: () =>
      import(
        /* webpackChunkName: "supervisor-Elasticsearch" */
        './containers/Elasticsearch.js'
      ),
    // importSync:
    //   // eslint-disable-next-line camelcase
    //   typeof __webpack_require__ === 'undefined'
    //     ? await import('./containers/Elasticsearch.js')
    //     : null,
    resolve: () => {
      if (contextRequire) {
        return contextRequire.resolve('./containers/Elasticsearch.js');
      }
      const { resolve } = import.meta;
      if (typeof resolve === 'function') {
        return resolve('./containers/Elasticsearch.js');
      }
    },
  },
  { ssr: false },
);

const Users = loadableEsm(
  {
    chunkName: 'supervisor-Users',
    importAsync: () =>
      import(
        /* webpackChunkName: "supervisor-Users" */
        './containers/Users.js'
      ),
    // importSync:
    //   // eslint-disable-next-line camelcase
    //   typeof __webpack_require__ === 'undefined'
    //     ? await import('./containers/Users.js')
    //     : null,
    resolve: () => {
      if (contextRequire) {
        return contextRequire.resolve('./containers/Users.js');
      }
      const { resolve } = import.meta;
      if (typeof resolve === 'function') {
        return resolve('./containers/Users.js');
      }
    },
  },
  { ssr: false },
);

const Lookup = loadableEsm(
  {
    chunkName: 'supervisor-Lookup',
    importAsync: () =>
      import(
        /* webpackChunkName: "supervisor-Lookup" */
        './containers/Lookup.js'
      ),
    resolve: () => {
      if (contextRequire) {
        return contextRequire.resolve('./containers/Lookup.js');
      }
      const { resolve } = import.meta;
      if (typeof resolve === 'function') {
        return resolve('./containers/Lookup.js');
      }
    },
  },
  { ssr: false },
);

export default (prefix = '') => [
  {
    path: prefix,
    component: App,
    routes: [
      { path: `${prefix}/`, exact: true, component: Dashboard },
      {
        path: `${prefix}/lookup`,
        component: Lookup,
      },
      {
        path: `${prefix}/announcement`,
        component: AnnouncementManager,
      },
      {
        path: `${prefix}/elasticsearch`,
        component: Elasticsearch,
      },
      {
        path: `${prefix}/users`,
        component: Users,
      },
    ],
  },
];
