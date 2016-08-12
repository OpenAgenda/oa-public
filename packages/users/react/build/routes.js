'use strict';

var React = require('react');

var _require = require('react-router');

var Route = _require.Route;
var IndexRoute = _require.IndexRoute;

var App = require('./containers/App');

var SettingsContainer = require('./containers/SettingsContainer');

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