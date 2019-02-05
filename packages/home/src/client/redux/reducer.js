import { reducer as form } from 'redux-form';
import menu from './modules/menu';
import agendas from './modules/agendas';
import events from './modules/events';
import modals from './modules/modals';

export default asyncReducers => ({
  form,
  modals,
  menu,
  agendas,
  events,
  res: ( s = {} ) => s,
  settings: ( s = {} ) => s,
  ...asyncReducers
});
