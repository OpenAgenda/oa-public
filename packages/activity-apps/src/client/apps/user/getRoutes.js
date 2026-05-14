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

const UserApp = loadableEsm({
  chunkName: 'activities-UserActivitiesApp',
  importAsync: () =>
    import(
      /* webpackChunkName: "activities-UserActivitiesApp" */
      '../../containers/UserApp/UserApp.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('../../containers/UserApp/UserApp.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/UserApp/UserApp.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('../../containers/UserApp/UserApp.js');
    }
  },
});

const UserDashboard = loadableEsm({
  chunkName: 'activities-UserActivitiesDashboard',
  importAsync: () =>
    import(
      /* webpackChunkName: "activities-UserActivitiesDashboard" */
      '../../containers/UserDashboard/UserDashboard.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('../../containers/UserDashboard/UserDashboard.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve(
        './containers/UserDashboard/UserDashboard.js',
      );
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('../../containers/UserDashboard/UserDashboard.js');
    }
  },
});

export default function (prefix = '') {
  return [
    {
      path: prefix,
      component: UserApp,
      routes: [{ path: `${prefix}/`, exact: true, component: UserDashboard }],
    },
  ];
}
