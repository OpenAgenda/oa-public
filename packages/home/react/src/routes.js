import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { App, Dashboard } from './containers';

export default function ( store ) {

  return (
    <Route path="/" component={App}>
      <IndexRoute component={Dashboard} />
    </Route>
  );

};
