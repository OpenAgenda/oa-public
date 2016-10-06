import app from './app';
import getRoutes from './editRoutes';
import du from 'dom-utils';
import { push } from 'react-router-redux';

export default function editApp( options ) {

  const setMenuLinks = ( { store } ) => {

    if ( typeof document !== 'undefined' ) {

      const tabs = [ {
        className: 'settings_profile',
        to: '/profile'
      }, {
        className: 'settings_contribution',
        to: '/contribution'
      } ];

      tabs.forEach( t => {

        du.addEvent( du.el( `.js_menu_item_${t.className}` ), 'click', e => {

          e.preventDefault();
          store.dispatch( push( t.to ) );

        } );

      } );

    }

  };

  return app( options, getRoutes, setMenuLinks );

}
