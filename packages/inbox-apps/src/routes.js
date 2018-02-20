import _ from 'lodash';
import React from 'react';
import { Route, IndexRoute } from 'react-router';
import du from '@openagenda/dom-utils';
import { App, Inbox, Conversation, ConversationCreate } from './containers';

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

export default function ( store, options ) {

  const params = _.merge( {
    selectMenuItem: false
  }, options );

  const onEnter = params.selectMenuItem ? selectItem( 'inbox' ) : _.noop;

  const state = store.getState();
  const { prefix } = state.settings;

  return (
    <Route
      path={prefix}
      component={App}
    >
      <IndexRoute
        component={Inbox}
        onEnter={onEnter}
      />
      <Route
        path="conversation/create"
        component={ConversationCreate}
        onEnter={onEnter}
      />
      <Route
        path="conversation/:conversationId"
        component={Conversation}
        onEnter={onEnter}
      />
    </Route>
  );

};
