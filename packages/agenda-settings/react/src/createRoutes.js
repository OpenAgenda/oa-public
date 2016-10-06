import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { CreationApp, AgendaCreation } from './containers';


export default function createRoutes() {

  return (
    <Route path="/" component={CreationApp}>
      <IndexRoute component={AgendaCreation} />
    </Route>
  );

}
