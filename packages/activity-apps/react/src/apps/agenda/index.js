import createApp from 'react-utils/dist/createApp';
import createStore from 'react-utils/dist/createStore';
import ApiClient from 'react-utils/dist/ApiClient';
import du from 'dom-utils';
import getRoutes from './routes';
import { push } from 'react-router-redux';
import reducer from '../../redux/reducer';

const normalizePrefix = prefix => prefix.substr( -1 ) === '/' ? prefix.slice( 0, -1 ) : prefix;

require( 'dom-utils/ie8' );
require( 'dom-utils/ie9' );

export default function ( options ) {

  return createApp( options.state, createStore( reducer ), getRoutes, ApiClient, setMenuLinks );

};

const setMenuLinks = ( { store } ) => {

  if ( typeof document === 'undefined' ) return;

  const state = store.getState();
  const prefix = normalizePrefix( state.settings.prefix );

  const tabs = [ {
    className: 'settings_activities',
    to: `${prefix}/activities`
  } ];

  tabs.forEach( t => {

    du.addEvent( du.el( `.js_menu_item_${t.className}` ), 'click', e => {

      e.preventDefault();
      store.dispatch( push( t.to ) );

    } );

  } );

};
