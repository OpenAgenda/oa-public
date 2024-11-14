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
  chunkName: 'home-App',
  importAsync: () =>
    import(
      /* webpackChunkName: "home-App" */
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

const Agendas = loadableEsm({
  chunkName: 'home-Agendas',
  importAsync: () =>
    import(
      /* webpackChunkName: "home-Agendas" */
      './containers/Agendas.js'
    ),
  importSync: !isWebpack ? await import('./containers/Agendas.js') : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/Agendas.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/Agendas.js');
    }
  },
});

const Events = loadableEsm({
  chunkName: 'home-Events',
  importAsync: () =>
    import(
      /* webpackChunkName: "home-Events" */
      './containers/Events.js'
    ),
  importSync: !isWebpack ? await import('./containers/Events.js') : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/Events.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/Events.js');
    }
  },
});

export default function getRootes(prefix = '', rootPrefix = prefix) {
  return [
    {
      path: rootPrefix,
      exact: true,
      component: App,
      routes: [
        { path: `${prefix}/`, exact: true, component: Agendas },
        { path: `${prefix}/events`, component: Events },
        { path: `${prefix}/agendas/member`, component: Agendas },
      ],
    },
  ];
}
