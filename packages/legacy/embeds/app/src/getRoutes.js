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
  chunkName: 'legacyEmbeds-App',
  importAsync: () =>
    import(
      /* webpackChunkName: "legacyEmbeds-App" */
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

const DashboardWrapper = loadableEsm({
  chunkName: 'legacyEmbeds-DashboardWrapper',
  importAsync: () =>
    import(
      /* webpackChunkName: "legacyEmbeds-DashboardWrapper" */
      './containers/DashboardWrapper.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/DashboardWrapper.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/DashboardWrapper.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/DashboardWrapper.js');
    }
  },
});

export default (prefix = '') => [
  {
    path: prefix,
    component: App,
    routes: [
      {
        exact: true,
        path: `${prefix}`,
        component: DashboardWrapper,
      },
    ],
  },
];
