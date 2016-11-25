import createReducer from 'react-utils/dist/createReducer';
import { reducer as form } from 'redux-form';
import sources from './modules/sources';
import modals from './modules/modals';

export default createReducer( {
  agenda: (s = {}) => s,
  form,
  sources,
  modals
} );
