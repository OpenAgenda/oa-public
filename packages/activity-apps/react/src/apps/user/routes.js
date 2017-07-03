import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { UserApp, UserDashboard } from '../../containers';

export default function ( store ) {

  const state = store.getState();
  const basename = state.settings.prefix;

  return (
    <Route path={basename} component={UserApp}>
      <IndexRoute component={UserDashboard} />
    </Route>
  );

};
