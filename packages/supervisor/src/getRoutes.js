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
  chunkName: 'supervisor-App',
  importAsync: () =>
    import(
      /* webpackChunkName: "supervisor-App" */
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

const Dashboard = loadableComponent(
  {
    chunkName: 'supervisor-Dashboard',
    importAsync: () =>
      import(
        /* webpackChunkName: "supervisor-Dashboard" */
        './containers/Dashboard.js'
      ),
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

const AnnouncementManager = loadableComponent(
  {
    chunkName: 'supervisor-AnnouncementManager',
    importAsync: () =>
      import(
        /* webpackChunkName: "supervisor-AnnouncementManager" */
        './containers/AnnouncementManager.js'
      ),
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

const Elasticsearch = loadableComponent(
  {
    chunkName: 'supervisor-Elasticsearch',
    importAsync: () =>
      import(
        /* webpackChunkName: "supervisor-Elasticsearch" */
        './containers/Elasticsearch.js'
      ),
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

export default (prefix = '') => [
  {
    path: prefix,
    component: App,
    routes: [
      { path: `${prefix}/`, exact: true, component: Dashboard },
      {
        path: `${prefix}/announcement`,
        component: AnnouncementManager,
        activeTab: 'profile',
      },
      {
        path: `${prefix}/elasticsearch`,
        component: Elasticsearch,
        activeTab: 'profile',
      },
    ],
  },
];
