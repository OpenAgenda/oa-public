import members from './modules/members';
import modals from './modules/modals';

export default asyncReducers => ({
  agenda: (s = {}) => s,
  member: (m = {}) => m,
  members,
  modals,
  res: (s = {}) => s,
  settings: (s = {}) => s,
  ...asyncReducers
});
