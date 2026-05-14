import loadableEsm from '@openagenda/react-shared/utils/loadableEsm';

// eslint-disable-next-line camelcase
const contextRequire = typeof __webpack_require__ !== 'undefined'
  ? import.meta.webpackContext
      && import.meta.webpackContext('../..', {
        recursive: true,
        regExp: /\.js$/,
        mode: 'weak',
      })
  : null;

const AgendaApp = loadableEsm({
  chunkName: 'activities-AgendaActivitiesApp',
  importAsync: () =>
    import(
      /* webpackChunkName: "activities-AgendaActivitiesApp" */
      '../../containers/AgendaApp/AgendaApp.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('../../containers/AgendaApp/AgendaApp.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/AgendaApp/AgendaApp.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('../../containers/AgendaApp/AgendaApp.js');
    }
  },
});

const AgendaDashboard = loadableEsm({
  chunkName: 'activities-AgendaActivitiesApp',
  importAsync: () =>
    import(
      /* webpackChunkName: "activities-AgendaActivitiesApp" */
      '../../containers/AgendaDashboard/AgendaDashboard.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('../../containers/AgendaDashboard/AgendaDashboard.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve(
        './containers/AgendaDashboard/AgendaDashboard.js',
      );
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('../../containers/AgendaDashboard/AgendaDashboard.js');
    }
  },
});

export default (prefix = '') => [
  {
    path: prefix,
    component: AgendaApp,
    routes: [{ path: `${prefix}/`, exact: true, component: AgendaDashboard }],
  },
];
