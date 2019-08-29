import { connectRouter } from 'connected-react-router';
import menu from './modules/menu';
import agendas from './modules/agendas';
import events from './modules/events';
import modals from './modules/modals';

export default ( history, asyncReducers ) => ({
  router: connectRouter( history ),
  modals,
  menu,
  agendas,
  events,
  res: ( s = {} ) => s,
  settings: ( s = {} ) => s,
  ...asyncReducers
});
