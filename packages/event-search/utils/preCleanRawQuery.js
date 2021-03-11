'use strict';

const ih = require('immutability-helper');

module.exports = (query = {}) => {
  const update = {
    $unset: []
  };

  try {
    if (query.state) {
      update.state = {
        $set: [].concat(query.state).map(s => typeof s === 'string' ? parseInt(s) : s)
      }
    }
  } catch (e) {
    log('error', 'provided state is invalid %j', query);
  }

  try {
    if (query.attendanceMode) {
      update.attendanceMode = {
        $set: [].concat(query.attendanceMode).map(s => typeof s === 'string' ? parseInt(s) : s)
      }
    }
  } catch (e) {
    log('error', 'provided attendanceMode is invalid %j', query);
  }

  if (query.date && (query.date.gte || query.date.lte)) {
    update['$unset'].push('date');
    update.timings = {
      $set: query.date
    }
  }

  return ih(query, update);
}
