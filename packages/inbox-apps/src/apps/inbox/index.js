import _ from 'lodash';
import createApp from '@openagenda/react-utils/dist/createApp';
import createStore from '@openagenda/react-utils/dist/createStore';
import ApiClient from '@openagenda/react-utils/dist/ApiClient';
import du from '@openagenda/dom-utils';
import createHistory from 'history/lib/createBrowserHistory';
import { push } from 'react-router-redux';
import getRoutes from '../../routes';
import reducer from '../../redux/reducer';

const normalizePrefix = prefix => prefix.substr( -1 ) === '/' ? prefix.slice( 0, -1 ) : prefix;

export default function ( options ) {

  const params = _.merge( {
    selectMenuItem: false
  }, options );

  const routesGetter = params.selectMenuItem ? _.partialRight( getRoutes, { selectMenuItem: true } ) : getRoutes;

  return createApp( {
    state: params.state,
    createHistory,
    createStore: createStore( reducer ),
    getRoutes: routesGetter,
    ApiClient,
    beforeCreate: params.selectMenuItem ? setMenuLinks : _.noop
  } );

};

const setMenuLinks = ( { store } ) => {

  if ( typeof document === 'undefined' ) return;

  const state = store.getState();
  const prefix = normalizePrefix( state.settings.prefix );

  const tabs = [ {
    classNamePart: 'inbox',
    to: `${prefix}/`
  } ];

  tabs.forEach( t => {

    du.addEvent( du.el( `.js_menu_item_${t.classNamePart}` ), 'click', e => {

      e.preventDefault();
      store.dispatch( push( t.to ) );

    } );

  } );

};
