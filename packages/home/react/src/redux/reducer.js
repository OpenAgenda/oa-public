import createReducer from '@openagenda/react-utils/dist/createReducer';
import { reducer as form } from 'redux-form';
import menu from './modules/menu';
import agendas from './modules/agendas';
import events from './modules/events';
import modals from './modules/modals';

export default createReducer( {
  form,
  modals,
  menu,
  agendas,
  events
} );
