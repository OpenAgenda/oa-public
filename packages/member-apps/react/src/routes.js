import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { App, Dashboard } from './containers';

export default function ( store ) {

  const state = store.getState();
  const basename = state.settings.prefix;

  return (
    <Route path={basename} component={App}>
      <IndexRoute component={Dashboard} />
    </Route>
  );

};
