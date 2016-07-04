import React from 'react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import showApp from './reducers/show'
import ShowComponent from './components/Show'

export default options => (
  <Provider store={ createStore( showApp ) }>
    <ShowComponent />
  </Provider>
);