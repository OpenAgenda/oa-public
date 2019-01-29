import { reducer as form } from 'redux-form';
import { connectRouter } from 'connected-react-router';
import userSettings from './modules/userSettings';

export default ( history, asyncReducers ) => ({
  router: connectRouter( history ),
  form,
  userSettings,
  res: ( s = {} ) => s,
  settings: ( s = {} ) => s,
  ...asyncReducers
});
