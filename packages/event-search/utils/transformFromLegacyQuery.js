'use strict';

const ih = require('immutability-helper');

module.exports = (query = {}) => {
  const update = {
    $unset: []
  };

  if (query.date && (query.date.gte || query.date.lte)) {
    update['$unset'].push('date');
    update.timings = {
      $set: query.date
    }
  }

  return ih(query, update);
}
