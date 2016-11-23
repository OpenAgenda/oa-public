import createReducer from 'react-utils/dist/createReducer';
import { reducer as form } from 'redux-form';
import sources from './modules/sources';

export default createReducer( {
  agenda: (s = {}) => s,
  form,
  sources
} );
