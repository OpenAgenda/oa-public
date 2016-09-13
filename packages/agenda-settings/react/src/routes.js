import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { App, AgendaCreation } from './containers';


export default function getRoutes() {

  return (
    <Route path="/" component={App}>
      <IndexRoute component={AgendaCreation} />
    </Route>
  );

}
