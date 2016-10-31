import createReducer from 'react-utils/dist/createReducer';
import { reducer as form } from 'redux-form'
import agendas from './modules/agendas';

export default createReducer( {
  form,
  agendas
} );
