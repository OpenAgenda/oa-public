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
  chunkName: 'agendaStats-App',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaStats-App" */
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

const Dashboard = loadableEsm({
  chunkName: 'agendaStats-Dashboard',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaStats-Dashboard" */
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

export default (prefix = '') => [
  {
    path: prefix,
    component: App,
    routes: [{ path: `${prefix}/`, exact: true, component: Dashboard }],
  },
];
