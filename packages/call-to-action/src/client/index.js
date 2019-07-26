import _ from 'lodash';
import React from 'react';
import ReactDom from 'react-dom';
import { Provider, ReactReduxContext } from 'react-redux';
import apiClient from '@openagenda/react-utils/dist/apiClient';
import createStore from '@openagenda/react-utils/dist/createStore';
import clientMiddleware from '@openagenda/react-utils/dist/clientMiddleware';
import { applyMiddleware, compose, bindActionCreators } from 'redux';
import getReducers from './redux/reducer';
import * as actions from './redux/modules/callToAction';
import { Request } from './containers';
import { onReady } from './openRequestForm';

export default function ( options ) {
  const params = _.merge( {
    initialState: {
      settings: {
        lang: 'fr',
        prefix: '',
        apiRoot: ''
      },
      res: {
        request: '/request'
      }
    },
    selector: '.js_call_to_action'
  }, options );

  const { initialState, req, selector } = params;
  const { apiRoot, prefix } = initialState.settings;

  const client = apiClient( apiRoot, req );
  const store = createStore(
    getReducers,
    initialState,
    compose(
      applyMiddleware(
        clientMiddleware( { client } )
        // ... other middlewares ... (like redux-logger)
      ),
      // ... other enhancers ... (like redux devtools)
    )
  );

  const openRequestForm = bindActionCreators( event => {
    if ( typeof event.preventDefault === 'function' ) {
      event.preventDefault();
    }

    if ( event instanceof Event ) {
      event.lang = event.target.getAttribute( 'data-lang' );
      event.subject = event.target.getAttribute( 'data-subject' );
      event.agenda = event.target.getAttribute( 'data-agenda' );
    }

    return actions.openRequestForm( event );
  }, store.dispatch );

  window.openRequestForm = openRequestForm;

  if ( params.selector ) {
    document.querySelectorAll( params.selector ).forEach( el => el.addEventListener( 'click', openRequestForm ) );
  }

  if ( onReady ) {
    openRequestForm( onReady );
  }

  const appDest = document.createElement( 'div' );
  appDest.className = 'js_call_to_action_canvas';
  window.document.body.insertAdjacentElement( 'beforeend', appDest );

  return ReactDom.render(
    <Provider store={store} key="provider" context={ReactReduxContext}>
      <Request />
    </Provider>,
    document.querySelector( '.js_call_to_action_canvas' )
  );

};
