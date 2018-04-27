const React = require( 'react' ),

  { Route, IndexRoute } = require( 'react-router' ),

  App = require( './containers/App' ),

  SettingsContainer = require( './containers/SettingsContainer' );


module.exports = store => {

  const state = store.getState();
  const lang = (state.app && state.app.appSettings && state.app.appSettings.lang) || null;
  const prefix = (state.app && state.app.appSettings && state.app.appSettings.prefix) || '/';

  return (
    <Route path={prefix} component={App} lang={lang}>
      <IndexRoute component={SettingsContainer} activeTab={false}/>
      <Route path="profile" component={SettingsContainer} activeTab="profile"/>
      <Route path="image" component={SettingsContainer} activeTab="image"/>
      <Route path="email" component={SettingsContainer} activeTab="email"/>
      <Route path="password" component={SettingsContainer} activeTab="password"/>
      <Route path="apiKey" component={SettingsContainer} activeTab="apiKey"/>
      <Route path="unsubscribed" component={SettingsContainer} activeTab="unsubscribed"/>
    </Route>
  );

};