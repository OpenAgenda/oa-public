'use strict';

const roleValues = require('./roleValues');

module.exports = roleValues.reduce((roles, v) => {
  roles[v.key] = v.code;
  return roles;
}, {});
