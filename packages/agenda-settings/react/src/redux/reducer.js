import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-connect';
import { reducer as form } from 'redux-form';
import agenda, { formPlugin as agendaPlugin } from './modules/agenda';
import modal from './modules/modal';
import keys from './modules/keys';

export default combineReducers( {
  routing: routerReducer,
  reduxAsyncConnect,
  form: form.plugin( {
    agendaCreation: agendaPlugin
  } ),
  res: ( s = {} ) => s,
  settings: ( s = {} ) => s,
  agenda,
  modal,
  keys
} );
