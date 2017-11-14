import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { EditionApp, ProfileEdition, ContributionEdition, AdvancedEdition } from './containers';
import du from '@openagenda/dom-utils';

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

export default function editRoutes( store ) {

  const state = store.getState();

  return (
    <Route path={state.settings.prefix} component={EditionApp}>
      <IndexRoute component={ProfileEdition} onEnter={selectItem( 'settings_profile' )} />
      <Route path="profile" component={ProfileEdition} onEnter={selectItem( 'settings_profile' )} />
      <Route path="contribution" component={ContributionEdition} onEnter={selectItem( 'settings_contribution' )} />
      <Route path="advanced" component={AdvancedEdition} onEnter={selectItem( 'settings_advanced' )} />
    </Route>
  );

}
