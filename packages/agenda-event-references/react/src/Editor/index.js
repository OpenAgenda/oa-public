"use strict";

import React from 'react'
import { Provider } from 'react-redux'
import editorApp from './reducers'
import Container from './containers'
import utils from 'utils'
import { createStore } from 'redux';

import actions from './actions'
import configureStore from './store/configure'
import clickTracker from '../clickTracker'

let DevTools;

export default options => {

  let initialState = utils.extend( {
    initUids: [],
    res: {
      events: '/events'
    },
    loading: false,
    error: false,
    events: [],
    search: {
      display: false
    }
  }, options || {} ),

  store = createStore( editorApp, initialState, configureStore );

  store.dispatch( actions.eventsLoad() );

  clickTracker( 'search', '.search', () => {

    store.dispatch( actions.searchHide() );

  } );

  return <Provider store={ store }>
    <Container />
  </Provider>

}