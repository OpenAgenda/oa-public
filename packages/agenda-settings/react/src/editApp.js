import app from './app';
import getRoutes from './editRoutes';
import du from 'dom-utils';
import { push } from 'react-router-redux';

const normalizePrefix = prefix => prefix.substr( -1 ) === '/' ? prefix.slice( 0, -1 ) : prefix;

export default function editApp( options ) {

  const setMenuLinks = ( { store } ) => {

    if ( typeof document === 'undefined' ) return;

    const state = store.getState();
    const prefix = normalizePrefix( state.settings.prefix );

    const tabs = [ {
      className: 'settings_profile',
      to: `${prefix}/profile`
    }, {
      className: 'settings_contribution',
      to: `${prefix}/contribution`
    } ];

    tabs.forEach( t => {

      du.addEvent( du.el( `.js_menu_item_${t.className}` ), 'click', e => {

        e.preventDefault();
        store.dispatch( push( t.to ) );

      } );

    } );

  };

  return app( options, getRoutes, setMenuLinks );

}
