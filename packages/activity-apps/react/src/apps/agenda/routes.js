import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { AgendaApp, AgendaDashboard } from '../../containers';
import du from 'dom-utils';

function selectItem( item ) {

  return () => {
    if ( typeof document !== 'undefined' ) {
      const elems = du.els( '.js_menu_item' );
      const elem = du.el( `.js_menu_item_${item}` );

      elems.forEach( e => {
        du.removeClass( e, 'selected' );
        du.removeClass( du.el( e, 'a' ), 'active' );
      } );

      if ( elem ) {
        du.addClass( elem, 'selected' );
        du.addClass( du.el( elem, 'a' ), 'active' );
      }
    }
  };

}

export default function ( store ) {

  const state = store.getState();
  const basename = state.settings.prefix;

  return (
    <Route path={basename} component={AgendaApp}>
      <IndexRoute component={AgendaDashboard} onEnter={selectItem( 'settings_activities' )} />
      <Route path="activities" component={AgendaDashboard} onEnter={selectItem( 'settings_activities' )} />
    </Route>
  );

};
