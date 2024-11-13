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
  chunkName: 'userApps-App',
  importAsync: () =>
    import(
      /* webpackChunkName: "userApps-App" */
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
const SettingsContainer = loadableComponent({
  chunkName: 'userApps-SettingsContainer',
  importAsync: () =>
    import(
      /* webpackChunkName: "userApps-SettingsContainer" */
      './containers/SettingsContainer.js'
    ),
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/SettingsContainer.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/SettingsContainer.js');
    }
  },
});

export default function getRoutes(prefix = '') {
  return [
    {
      path: prefix,
      component: App,
      routes: [
        { path: `${prefix}/`, exact: true, component: SettingsContainer },
        {
          path: `${prefix}/profile`,
          component: SettingsContainer,
          activeTab: 'profile',
        },
        {
          path: `${prefix}/image`,
          component: SettingsContainer,
          activeTab: 'image',
        },
        {
          path: `${prefix}/email`,
          component: SettingsContainer,
          activeTab: 'email',
        },
        {
          path: `${prefix}/password`,
          component: SettingsContainer,
          activeTab: 'password',
        },
        {
          path: `${prefix}/apiKey`,
          component: SettingsContainer,
          activeTab: 'apiKey',
        },
        {
          path: `${prefix}/emails`,
          component: SettingsContainer,
          activeTab: 'emails',
        },
      ],
    },
  ];
}
