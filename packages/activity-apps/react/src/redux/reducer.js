import createReducer from 'react-utils/dist/createReducer';
import { reducer as form } from 'redux-form';
import modals from './modules/modals';
import activities from './modules/activities';

const noopReducer = ( state = {} ) => state;

export default createReducer( {
  form,
  modals,
  activities
} );
