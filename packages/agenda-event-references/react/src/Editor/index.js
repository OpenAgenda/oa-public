import React from 'react'
import { Provider } from 'react-redux'
import editorApp from './reducers'
import Container from './containers'
import utils from '@openagenda/utils'
import { createStore } from 'redux';

import actions from './actions'
import configureStore from './store/configure'
import clickTracker from '../clickTracker'

let store;

export default options => {

  if ( !store ) {

    let initialState = utils.extend( {
      uid: null,
      initUids: [],
      lang: 'fr',
      res: {
        events: '/events',
        suggestions: '/suggestions'
      },
      loading: false,
      loadingSuggestions: false,
      sample: null, // suggest events feature
      error: false,
      info: null,
      events: [],
      search: {
        searching: false,
        query: null,
        display: false,
        events: null,
        suggestions: null
      }
    }, options || {} ),

    onChange = options.onChange;

    store = createStore( editorApp, initialState, configureStore );

    store.dispatch( actions.eventsLoad() );

    clickTracker( 'search', '.search', () => {

      store.dispatch( actions.searchHide() );

    } );

    if ( onChange ) {

      store.subscribe( function() {

        onChange( store.getState().events.map( e => e.uid ) );

      } );

    }

  } else if ( options.sample ) {

    store.dispatch( actions.resetSuggestions( options.sample ) );

  }


  return <Provider store={ store }>
    <Container />
  </Provider>

}
