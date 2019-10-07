import { reducer as form } from 'redux-form';
import modals from './modules/modals';
import activities from './modules/activities';

export default asyncReducers => ({
  form,
  modals,
  activities,
  agenda: ( s = {} ) => s,
  res: ( s = {} ) => s,
  settings: ( s = {} ) => s,
  ...asyncReducers
});
