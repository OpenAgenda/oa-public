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
  chunkName: 'home-App',
  importAsync: () =>
    import(
      /* webpackChunkName: "home-App" */
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

const Agendas = loadableEsm({
  chunkName: 'home-Agendas',
  importAsync: () =>
    import(
      /* webpackChunkName: "home-Agendas" */
      './containers/Agendas.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/Agendas.js')
      : null,
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
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/Events.js')
      : null,
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
