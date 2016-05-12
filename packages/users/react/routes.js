"use strict";

const React = require( 'react' ),

  { Route, IndexRoute } = require( 'react-router' ),

  App = require( './containers/App' ),

  SettingsContainer = require( './containers/SettingsContainer' );


module.exports = store => {

  return (
    <Route path="/" component={App}>
      <IndexRoute component={SettingsContainer} activeTab="profile"/>
      <Route path="profile" component={SettingsContainer} activeTab="profile"/>
      <Route path="email" component={SettingsContainer} activeTab="email"/>
      <Route path="password" component={SettingsContainer} activeTab="password"/>
      <Route path="apiKey" component={SettingsContainer} activeTab="apiKey"/>
    </Route>
  );

};