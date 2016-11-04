'use strict';

var React = require('react'),
    _require = require('react-router'),
    Route = _require.Route,
    IndexRoute = _require.IndexRoute,
    App = require('./containers/App'),
    SettingsContainer = require('./containers/SettingsContainer');

module.exports = function (store) {

  var state = store.getState(),
      lang = state.app && state.app.appSettings && state.app.appSettings.lang || null;

  return React.createElement(
    Route,
    { path: '/', component: App, lang: lang },
    React.createElement(IndexRoute, { component: SettingsContainer, activeTab: false }),
    React.createElement(Route, { path: 'profile', component: SettingsContainer, activeTab: 'profile' }),
    React.createElement(Route, { path: 'image', component: SettingsContainer, activeTab: 'image' }),
    React.createElement(Route, { path: 'email', component: SettingsContainer, activeTab: 'email' }),
    React.createElement(Route, { path: 'password', component: SettingsContainer, activeTab: 'password' }),
    React.createElement(Route, { path: 'apiKey', component: SettingsContainer, activeTab: 'apiKey' })
  );
};