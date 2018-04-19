import createReducer from '@openagenda/react-utils/dist/createReducer';
import { reducer as form } from 'redux-form';
import modals from './modules/modals';
import activities from './modules/activities';

const noopReducer = ( state = {} ) => state;

export default createReducer( {
  form,
  agenda: noopReducer,
  modals,
  activities
} );
