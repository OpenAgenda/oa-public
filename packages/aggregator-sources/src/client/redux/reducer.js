import { reducer as form } from 'redux-form';
import { connectRouter } from 'connected-react-router';
import agenda from './modules/agenda';
import sources from './modules/sources';
import modals from './modules/modals';

export default ( history, asyncReducers ) => ({
  router: connectRouter( history ),
  form,
  agenda,
  sources,
  modals,
  res: ( s = {} ) => s,
  settings: ( s = {} ) => s,
  ...asyncReducers
});
