import loadableEsm from '@openagenda/react-shared/src/utils/loadableEsm.mjs';

// eslint-disable-next-line camelcase
const isWebpack = typeof __webpack_require__ !== 'undefined';
const contextRequire = isWebpack
  ? import.meta.webpackContext('.', {
    recursive: true,
    regExp: /\.js$/,
    mode: 'weak',
  })
  : null;

const App = loadableEsm({
  chunkName: 'members-App',
  importAsync: () =>
    import(
      /* webpackChunkName: "members-App" */
      './containers/App/App.js'
    ),
  importSync: !isWebpack ? await import('./containers/App/App.js') : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/App/App.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/App/App.js');
    }
  },
});

const Dashboard = loadableEsm({
  chunkName: 'members-Dashboard',
  importAsync: () =>
    import(
      /* webpackChunkName: "members-Dashboard" */
      './containers/Dashboard/Dashboard.js'
    ),
  importSync: !isWebpack
    ? await import('./containers/Dashboard/Dashboard.js')
    : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/Dashboard/Dashboard.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/Dashboard/Dashboard.js');
    }
  },
});

export default function getRoutes(prefix = '') {
  return [
    {
      path: prefix,
      component: App,
      routes: [{ path: `${prefix}/`, exact: true, component: Dashboard }],
    },
  ];
}
