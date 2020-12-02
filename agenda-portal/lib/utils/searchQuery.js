'use strict';

const _ = require('lodash');

module.exports = (query, { defaultFilter }) => {
  if (!_.keys(query).length) {
    return defaultFilter || null;
  }

  return query;
};
