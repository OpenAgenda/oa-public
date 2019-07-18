import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { createMemoryHistory } from 'history';
import { applyMiddleware, compose, bindActionCreators } from 'redux';
import { Provider, ReactReduxContext } from 'react-redux';
import apiClient from '@openagenda/react-utils/dist/apiClient';
import createStore from '@openagenda/react-utils/dist/createStore';
import clientMiddleware from '@openagenda/react-utils/dist/clientMiddleware';
import du from '@openagenda/dom-utils';
import getReducers from '../../redux/reducer';
import { ConversationFormApp } from '../../containers';
import { onReady } from './openConversationForm';
import * as actions from '../../redux/modules/conversationForm';

function parseJsonField( value ) {
  try {
    return JSON.parse( value );
  } catch ( e ) {
    return value;
  }
}

const defaults = {
  initialState: {
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
};

export default function ( options = {} ) {
  const { initialState, req, selector, appDestClassName } = _.merge( {}, defaults, options );
  const { apiRoot } = initialState.settings;

  const client = apiClient( apiRoot, req );
  const history = options.history || createMemoryHistory();
  const store = createStore(
    getReducers.bind( null, history ),
    initialState,
    compose(
      applyMiddleware(
        clientMiddleware( { client } )
        // ... other middlewares ... (like redux-logger)
      ),
      __CLIENT__ && __DEVELOPMENT__ && window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__()
        : v => v
    )
  );


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

  if ( selector ) {
    du.els( selector ).map( el => du.addEvent( el, 'click', openConversationForm ) );
  }

  if ( onReady ) openConversationForm( onReady );

  const appDest = document.createElement( 'div' );
  appDest.className = appDestClassName;
  window.document.body.insertAdjacentElement( 'beforeend', appDest );

  const element = (
    <Provider store={store} key="provider" context={ReactReduxContext}>
      <ConversationFormApp />
    </Provider>
  );

  ReactDOM.render( element, du.el( `.${appDestClassName}` ) );

  return {
    store,
    element
  };
};
