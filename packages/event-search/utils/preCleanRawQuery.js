'use strict';

const { produce } = require('immer');

module.exports = produce((query = {}) => {
  try {
    if (query.state) {
      query.state = []
        .concat(query.state)
        .map(s => typeof s === 'string' ? parseInt(s) : s);
    }
  } catch (e) {
    log('error', 'provided state is invalid %j', query);
  }

  try {
    if (query.attendanceMode) {
      query.attendanceMode = []
        .concat(query.attendanceMode)
        .map(s => typeof s === 'string' ? parseInt(s) : s);
    }
  } catch (e) {
    log('error', 'provided attendanceMode is invalid %j', query);
  }

  if (query.date && (query.date.gte || query.date.lte)) {
    query.timings = query.date;
    delete query.date;
  }
});
