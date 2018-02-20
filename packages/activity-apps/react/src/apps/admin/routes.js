import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { AdminApp, AdminDashboard } from '../../containers';

export default function ( store ) {

  const state = store.getState();
  const basename = state.settings.prefix;

  return (
    <Route path={basename} component={AdminApp}>
      <IndexRoute component={AdminDashboard} />
    </Route>
  );

};
