import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { Provider } from 'react-redux';
import createHistory from 'history/lib/createBrowserHistory';
import createStore from '@openagenda/react-utils/dist/createStore';
import ApiClient from '@openagenda/react-utils/dist/ApiClient';
import du from '@openagenda/dom-utils';
import reducer from '../../redux/reducer';
import { ConversationFormApp } from '../../containers';
import { onReady } from './openConversationForm';
import * as actions from '../../redux/modules/conversationForm';

export default function createApp( options ) {

  const params = _.merge( {
    state: {
      settings: {
        lang: 'fr',
        prefix: '',
        apiRoot: ''
      },
      res: {
        conversations: {
          create: '/user/conversations'
        }
      }
    },
    selector: '.js_conversation_form',
    appDestClassName: 'js_conversation_form_canvas'
  }, options );

  const client = new ApiClient( params.state.settings.apiRoot );
  const browserHistory = createHistory();
  const store = createStore( reducer )( browserHistory, client, params.state );

  const openConversationForm = bindActionCreators( data => {
    if ( data instanceof Event ) {
      return actions.openConversationForm( {
        lang: data.target.getAttribute( 'data-lang' ),
        destinationInbox: parseJsonField( data.target.getAttribute( 'data-destination-inbox' ) ),
        type: data.target.getAttribute( 'data-type' ),
        typeIdentifier: data.target.getAttribute( 'data-type-identifier' ),
        params: parseJsonField( data.target.getAttribute( 'data-params' ) ) || {}
      } );
    }

    return actions.openConversationForm( data );
  }, store.dispatch );

  window.openConversationForm = openConversationForm;

  if ( params.selector ) {
    du.els( params.selector ).map( el => du.addEvent( el, 'click', openConversationForm ) );
  }

  if ( onReady ) openConversationForm( onReady );

  const appDest = document.createElement( 'div' );
  appDest.className = params.appDestClassName;
  window.document.body.insertAdjacentElement( 'beforeend', appDest );

  return ReactDOM.hydrate(
    <Provider store={store} key="provider">
      <ConversationFormApp />
    </Provider>,
    du.el( `.${params.appDestClassName}` )
  );

}

function parseJsonField( value ) {
  try {
    return JSON.parse( value );
  } catch (e) {
    return value;
  }
}
