import roleValues from './roleValues.js';

export default roleValues.reduce((roles, v) => {
  roles[v.key] = v.code;
  return roles;
}, {});
