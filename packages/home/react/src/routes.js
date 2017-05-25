import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { setTab as _setTab } from './redux/modules/menu';
import { App, Agendas, Events } from './containers';

let actualTab = null;

export default function ( store ) {

  const state = store.getState();
  const basename = state.settings.prefix;

  const setTab = tab => () => store.dispatch( _setTab( tab ) );

  return (
    <Route path={basename || '/'} component={App} tab={actualTab}>
      <IndexRoute component={Agendas} onEnter={setTab( 'agendas' )} />
      <Route path="events" component={Events} onEnter={setTab( 'events' )} />
    </Route>
  );

};
