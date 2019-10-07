import { reducer as form } from 'redux-form';
import agenda from './modules/agenda';
import sources from './modules/sources';
import modals from './modules/modals';

export default asyncReducers => ({
  form,
  agenda,
  sources,
  modals,
  res: ( s = {} ) => s,
  settings: ( s = {} ) => s,
  ...asyncReducers
});
