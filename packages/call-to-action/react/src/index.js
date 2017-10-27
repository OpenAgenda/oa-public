import React from 'react';
import ReactDom from 'react-dom';
import merge from 'lodash/merge';
import createHistory from 'history/lib/createBrowserHistory'
import { Provider } from 'react-redux';
import createStore from '@openagenda/react-utils/dist/createStore';
import ApiClient from '@openagenda/react-utils/dist/ApiClient';
import du from '@openagenda/dom-utils';
import { bindActionCreators } from 'redux';
import reducer from './redux/reducer';
import * as actions from './redux/modules/callToAction';
import { Request } from './containers';
import { onReady } from './openRequestForm';

export default function createApp( options ) {

  const params = merge( {
    state: {
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

  const client = new ApiClient( params.state.settings.apiRoot );
  const browserHistory = createHistory();
  const store = createStore( reducer )( browserHistory, client, params.state );

  const openRequestForm = bindActionCreators( data => {
    if ( data instanceof Event ) {
      data.lang = data.target.getAttribute( 'data-lang' );
      data.subject = data.target.getAttribute( 'data-subject' );
      data.agenda = data.target.getAttribute( 'data-agenda' );
    }

    return actions.openRequestForm( data );
  }, store.dispatch );

  window.openRequestForm = openRequestForm;

  if ( params.selector ) {
    du.els( params.selector ).map( el => du.addEvent( el, 'click', openRequestForm ) );
  }

  if ( onReady ) openRequestForm( onReady );

  const appDest = document.createElement( 'div' );
  appDest.className = 'js_call_to_action_canvas';
  window.document.body.insertAdjacentElement( 'beforeend', appDest );

  return ReactDom.render( <Provider store={store} key="provider">
    <Request />
  </Provider>, du.el( '.js_call_to_action_canvas' ) );

};
