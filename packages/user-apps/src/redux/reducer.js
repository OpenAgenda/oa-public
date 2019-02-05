import { reducer as form } from 'redux-form';
import userSettings from './modules/userSettings';

export default asyncReducers => ({
  form,
  userSettings,
  res: ( s = {} ) => s,
  settings: ( s = {} ) => s,
  ...asyncReducers
});
