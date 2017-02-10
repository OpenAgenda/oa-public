import createReducer from 'react-utils/dist/createReducer';
import { reducer as form } from 'redux-form';
import members from './modules/members';
import modals from './modules/modals';

export default createReducer( {
  form,
  agenda: ( state = {} ) => state,
  stakeholder: ( state = {} ) => state,
  members,
  modals
} );
