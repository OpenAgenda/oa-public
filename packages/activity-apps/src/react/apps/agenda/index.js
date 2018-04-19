import createApp from '@openagenda/react-utils/dist/createApp';
import createStore from '@openagenda/react-utils/dist/createStore';
import ApiClient from '@openagenda/react-utils/dist/ApiClient';
import du from '@openagenda/dom-utils';
import { push } from 'react-router-redux';
import getRoutes from './routes';
import reducer from '../../redux/reducer';

const normalizePrefix = prefix => prefix.substr( -1 ) === '/' ? prefix.slice( 0, -1 ) : prefix;

export default function ( options ) {

  return createApp( options.state, createStore( reducer ), getRoutes, ApiClient, setMenuLinks );

};

const setMenuLinks = ( { store } ) => {

  if ( typeof document === 'undefined' ) return;

  const state = store.getState();
  const prefix = normalizePrefix( state.settings.prefix );

  const tabs = [ {
    className: 'activities',
    to: `${prefix}/activities`
  } ];

  tabs.forEach( t => {

    du.addEvent( du.el( `.js_menu_item_${t.className}` ), 'click', e => {

      e.preventDefault();
      store.dispatch( push( t.to ) );

    } );

  } );

};
