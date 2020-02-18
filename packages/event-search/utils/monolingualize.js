'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');

module.exports = (fields, languages = [], event) => {
  if (!languages.length) {
    return event;
  }

  return ih(event, fields.reduce((update, field) => {
    const current = _.get(event, field, null);
    if (!_.isObject(current)) {
      return update;
    }

    const language = _.first([].concat(languages).filter(language => current[language]));

    return {
      ...update,
      [field]: { $set: current[language] }
    }
  }, {}));
}
