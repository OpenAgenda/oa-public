import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { CreationApp, AgendaCreation } from './containers';


export default function createRoutes( store ) {

  const state = store.getState();

  return (
    <Route path={state.settings.prefix} component={CreationApp}>
      <IndexRoute component={AgendaCreation} />
    </Route>
  );

}
