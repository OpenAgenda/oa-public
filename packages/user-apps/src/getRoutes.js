import loadable from './loadable';

const App = loadable( () => import( /* webpackChunkName: "userApps-App" */ './containers/App' ) );
const SettingsContainer = loadable( () => import(
  /* webpackChunkName: "userApps-SettingsContainer" */
  './containers/SettingsContainer'
  ) );

export default function ( prefix = '' ) {
  return [
    {
      path: prefix,
      component: App,
      routes: [
        { path: `${prefix}/`, exact: true, component: SettingsContainer },
        { path: `${prefix}/profile`, component: SettingsContainer, activeTab: 'profile' },
        { path: `${prefix}/image`, component: SettingsContainer, activeTab: 'image' },
        { path: `${prefix}/email`, component: SettingsContainer, activeTab: 'email' },
        { path: `${prefix}/password`, component: SettingsContainer, activeTab: 'password' },
        { path: `${prefix}/apiKey`, component: SettingsContainer, activeTab: 'apiKey' },
        { path: `${prefix}/emails`, component: SettingsContainer, activeTab: 'emails' }
      ]
    }
  ];
};
