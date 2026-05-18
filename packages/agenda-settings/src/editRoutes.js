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

const EditionApp = loadableEsm({
  chunkName: 'agendaSettings-EditionApp',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaSettings-EditionApp" */
      './containers/EditionApp/EditionApp.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/EditionApp/EditionApp.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/EditionApp/EditionApp.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/EditionApp/EditionApp.js');
    }
  },
});

const GettingStarted = loadableEsm({
  chunkName: 'agendaSettings-GettingStarted',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaSettings-GettingStarted" */
      './components/GettingStarted.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./components/GettingStarted.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./components/GettingStarted.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./components/GettingStarted.js');
    }
  },
});

const ProfileEdition = loadableEsm({
  chunkName: 'agendaSettings-ProfileEdition',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaSettings-ProfileEdition" */
      './containers/ProfileEdition/ProfileEdition.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/ProfileEdition/ProfileEdition.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve(
        './containers/ProfileEdition/ProfileEdition.js',
      );
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/ProfileEdition/ProfileEdition.js');
    }
  },
});

const ContributionEdition = loadableEsm({
  chunkName: 'agendaSettings-ContributionEdition',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaSettings-ContributionEdition" */
      './containers/ContributionEdition/ContributionEdition.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/ContributionEdition/ContributionEdition.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve(
        './containers/ContributionEdition/ContributionEdition.js',
      );
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/ContributionEdition/ContributionEdition.js');
    }
  },
});

const AdvancedEdition = loadableEsm({
  chunkName: 'agendaSettings-AdvancedEdition',
  importAsync: () =>
    import(
      /* webpackChunkName: "agendaSettings-AdvancedEdition" */
      './containers/AdvancedEdition/AdvancedEdition.js'
    ),
  importSync:
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === 'undefined'
      ? await import('./containers/AdvancedEdition/AdvancedEdition.js')
      : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve(
        './containers/AdvancedEdition/AdvancedEdition.js',
      );
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/AdvancedEdition/AdvancedEdition.js');
    }
  },
});

export default function editRoutes(prefix = '') {
  return [
    {
      path: prefix,
      component: EditionApp,
      routes: [
        {
          path: `${prefix}/getting-started`,
          exact: true,
          component: GettingStarted,
        },
        { path: `${prefix}/settings`, exact: true, component: ProfileEdition },
        { path: `${prefix}/settings/profile`, component: ProfileEdition },
        {
          path: `${prefix}/settings/contribution`,
          component: ContributionEdition,
        },
        { path: `${prefix}/settings/advanced`, component: AdvancedEdition },
      ],
    },
  ];
}
