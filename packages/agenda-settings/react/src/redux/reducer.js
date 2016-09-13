import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-connect';
import { reducer as form } from 'redux-form';
import agenda, { formPlugin as agendaPlugin } from './modules/agenda';

export default combineReducers({
  routing: routerReducer,
  reduxAsyncConnect,
  form: form.plugin({
    agendaCreation: agendaPlugin
  }),
  agenda
});