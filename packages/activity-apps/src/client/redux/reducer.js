import { reducer as form } from 'redux-form';
import { connectRouter } from 'connected-react-router';
import modals from './modules/modals';
import activities from './modules/activities';

export default ( history, asyncReducers ) => ({
  router: connectRouter( history ),
  form,
  modals,
  activities,
  agenda: ( s = {} ) => s,
  res: ( s = {} ) => s,
  settings: ( s = {} ) => s,
  ...asyncReducers
});
