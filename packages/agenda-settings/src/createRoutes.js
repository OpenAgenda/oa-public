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

const CreationApp = loadableEsm({
  chunkName: 'agendaSettings-CreationApp',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaSettings-CreationApp" */
      './containers/CreationApp/CreationApp.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/CreationApp/CreationApp.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/CreationApp/CreationApp.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/CreationApp/CreationApp.js');
    }
  },
});

const AgendaCreation = loadableEsm({
  chunkName: 'agendaSettings-AgendaCreation',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaSettings-AgendaCreation" */
      './containers/AgendaCreation/AgendaCreation.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/AgendaCreation/AgendaCreation.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve(
        './containers/AgendaCreation/AgendaCreation.js',
      );
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/AgendaCreation/AgendaCreation.js');
    }
  },
});

export default (prefix = '') => [
  {
    path: prefix,
    component: CreationApp,
    routes: [{ path: `${prefix}/`, exact: true, component: AgendaCreation }],
  },
];
