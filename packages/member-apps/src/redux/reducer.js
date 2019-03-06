import { reducer as form } from 'redux-form';
import members from './modules/members';
import modals from './modules/modals';

export default asyncReducers => ({
  form,
  agenda: ( s = {} ) => s,
  stakeholder: ( s = {} ) => s,
  members,
  modals,
  res: ( s = {} ) => s,
  settings: ( s = {} ) => s,
  ...asyncReducers
});
