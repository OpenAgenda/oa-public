import { connectRouter } from 'connected-react-router';
import members from './modules/members';
import modals from './modules/modals';

export default (history, asyncReducers) => ({
  router: connectRouter(history),
  agenda: (s = {}) => s,
  member: (m = {}) => m,
  members,
  modals,
  res: (s = {}) => s,
  settings: (s = {}) => s,
  ...asyncReducers
});
