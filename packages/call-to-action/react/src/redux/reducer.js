import { combineReducers } from 'redux';
import callToAction from './modules/callToAction';
import { reducer as form } from 'redux-form';

const noopReducer = ( state = {} ) => state;

export default  combineReducers( {
  res: noopReducer,
  settings: noopReducer,
  form,
  callToAction
} )
