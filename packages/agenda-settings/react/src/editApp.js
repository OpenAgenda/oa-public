import app from './app';
import getRoutes from './editRoutes';
import du from '@openagenda/dom-utils';
import { push } from 'react-router-redux';

export default function editApp( options ) {

  const setMenuLinks = ( { store } ) => {

    if ( typeof document === 'undefined' ) return;

    const tabs = [ {
      className: 'settings_profile'
    }, {
      className: 'settings_contribution'
    }, {
      className: 'settings_advanced'
    } ];

    tabs.forEach( t => {

      const elem = du.el( `.js_menu_item_${t.className}` );

      du.addEvent( elem, 'click', e => {

        du.preventDefault( e );

        store.dispatch( push( elem.querySelector( 'a' ).getAttribute( 'href' ) ) );

      } );

    } );

  };

  return app( options, getRoutes, setMenuLinks );

}
