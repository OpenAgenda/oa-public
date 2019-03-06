import { reducer as form } from 'redux-form';
import inbox from './modules/inbox';
import conversation from './modules/conversation';
import conversationForm from './modules/conversationForm';
import modals from './modules/modals';

export default asyncReducers => ({
  form,
  inbox,
  conversation,
  conversationForm,
  modals,
  user: ( s = {} ) => s,
  agenda: ( s = {} ) => s,
  event: ( s = {} ) => s,
  res: ( s = {} ) => s,
  settings: ( s = {} ) => s,
  ...asyncReducers
});
