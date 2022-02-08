'use strict';

const _ = require('lodash');
const fieldsByAccess = require('./flattenedByFieldAccess');

module.exports = (agenda, type = 'read', access = 'public') => {
  return (
    fieldsByAccess[type][access] ?? fieldsByAccess[type].public
  ).reduce((filtered, field) => {
    const value = _.get(agenda, field.field);
    if (field.type === 'schema' || value === undefined) {
      return filtered;
    }
    return _.set(filtered, field.field, value);
  }, {});
}
