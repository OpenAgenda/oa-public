import createReducer from '@openagenda/react-utils/dist/createReducer';
import { reducer as form } from 'redux-form';
import agenda from './modules/agenda';
import sources from './modules/sources';
import modals from './modules/modals';

export default createReducer( {
  agenda,
  form,
  sources,
  modals
} );
