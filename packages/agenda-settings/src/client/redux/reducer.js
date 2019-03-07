import { reducer as form } from 'redux-form';
import agenda, { formPlugin as agendaPlugin } from './modules/agenda';
import modals from './modules/modals';
import keys from './modules/keys';

export default asyncReducers => ({
  form: form.plugin( {
    agendaCreation: agendaPlugin
  } ),
  res: ( s = {} ) => s,
  settings: ( s = {} ) => s,
  agenda,
  modals,
  keys,
  ...asyncReducers
});
