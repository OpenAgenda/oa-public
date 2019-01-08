import { reducer as form } from 'redux-form';
import callToAction from './modules/callToAction';

export default asyncReducers => ({
  form,
  callToAction,
  res: ( s = {} ) => s,
  settings: ( s = {} ) => s,
  ...asyncReducers
});
