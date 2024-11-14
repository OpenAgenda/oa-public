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
  chunkName: 'agendaStats-App',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaStats-App" */
      './containers/App.js'
    ),
  importSync: !isWebpack ? await import('./containers/App.js') : null,
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

const Dashboard = loadableEsm({
  chunkName: 'agendaStats-Dashboard',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaStats-Dashboard" */
      './containers/Dashboard.js'
    ),
  importSync: !isWebpack ? await import('./containers/Dashboard.js') : null,
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

export default (prefix = '') => [
  {
    path: prefix,
    component: App,
    routes: [{ path: `${prefix}/`, exact: true, component: Dashboard }],
  },
];
