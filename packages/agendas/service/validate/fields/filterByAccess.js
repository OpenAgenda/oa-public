'use strict';

const _ = require('lodash');
const fieldsByAccess = require('./flattenedByFieldAccess');

module.exports = (agenda, access = 'public') => {
  return fieldsByAccess[access].reduce((filtered, field) => {
    const value = _.get(agenda, field.field);
    if (value === undefined) {
      return filtered;
    }
    return _.set(filtered, field.field, value);
  }, {});
}
