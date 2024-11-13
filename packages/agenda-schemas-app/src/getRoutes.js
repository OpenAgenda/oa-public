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
  chunkName: 'agendaSchemas-App',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaSchemas-App" */
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
  chunkName: 'agendaSchemas-Dashboard',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaSchemas-Dashboard" */
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
    routes: [
      {
        path: `${prefix}`,
        exact: true,
        component: Dashboard,
      },
      {
        path: `${prefix}/member`,
        exact: true,
        component: Dashboard,
      },
    ],
  },
];
