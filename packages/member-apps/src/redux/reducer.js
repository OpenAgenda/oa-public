import { reducer as form } from 'redux-form';
import { connectRouter } from 'connected-react-router';
import members from './modules/members';
import modals from './modules/modals';

export default ( history, asyncReducers ) => ({
  router: connectRouter( history ),
  form,
  agenda: ( s = {} ) => s,
  stakeholder: ( s = {} ) => s,
  members,
  modals,
  res: ( s = {} ) => s,
  settings: ( s = {} ) => s,
  ...asyncReducers
});
