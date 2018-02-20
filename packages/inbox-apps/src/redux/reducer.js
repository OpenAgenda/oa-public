import createReducer from '@openagenda/react-utils/dist/createReducer';
import { reducer as form } from 'redux-form';
import inbox from './modules/inbox';
import conversation from './modules/conversation';
import conversationForm from './modules/conversationForm';
import modals from './modules/modals';

const noop = (v = null) => v;

export default createReducer( {
  form,
  inbox,
  conversation,
  conversationForm,
  modals,
  user: noop,
  agenda: noop,
  event: noop
} );
