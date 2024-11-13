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
  chunkName: 'eventAdmin-App',
  importAsync: () =>
    import(
      /* webpackChunkName: "eventAdmin-App" */
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

const Dashboard = loadableComponent({
  chunkName: 'eventAdmin-Dashboard',
  importAsync: () =>
    import(
      /* webpackChunkName: "eventAdmin-Dashboard" */
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
});

export default (prefix = '') => [
  {
    path: prefix,
    component: App,
    routes: [{ path: `${prefix}/`, exact: true, component: Dashboard }],
  },
];
