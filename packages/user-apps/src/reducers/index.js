const { combineReducers } = require( 'redux' ),
  
  { routerReducer } = require( 'react-router-redux' ),

  { reducer: form } = require( 'redux-form' ),

  app = require( './app' ),

  userSettings = require( './userSettings' );


module.exports = combineReducers( {
  routing: routerReducer,
  form,
  app,
  userSettings
} );