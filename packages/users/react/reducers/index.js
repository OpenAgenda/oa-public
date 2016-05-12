const { combineReducers } = require( 'redux' ),
  
  { routerReducer } = require( 'react-router-redux' ),

  { reducer: form } = require( 'redux-form' ),

  userSettings = require( './user-settings' );


module.exports = combineReducers( {
  routing: routerReducer,
  form,
  userSettings
} );