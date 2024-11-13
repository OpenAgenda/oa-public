import { loadableComponent } from '@openagenda/react-shared';

// eslint-disable-next-line camelcase
const contextRequire = typeof __webpack_require__ !== 'undefined'
  ? import.meta.webpackContext('.', {
    recursive: true,
    regExp: /\.js$/,
    mode: 'weak',
  })
  : null;

const CreationApp = loadableComponent({
  chunkName: 'agendaSettings-CreationApp',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaSettings-CreationApp" */
      './containers/CreationApp/CreationApp.js'
    ),
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

const AgendaCreation = loadableComponent({
  chunkName: 'agendaSettings-AgendaCreation',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaSettings-AgendaCreation" */
      './containers/AgendaCreation/AgendaCreation.js'
    ),
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
