'use strict';

const { produce } = require('immer');

module.exports = produce((query = {}) => {
  try {
    ['state', 'status'].forEach(f => {
      if (!query[f]) {
        return;
      }

      query[f] = []
        .concat(query[f])
        .map(s => typeof s === 'string' ? parseInt(s) : s);
    });
  } catch (e) {
    log('error', 'provided state is invalid %j', query);
  }

  if (Array.isArray(query.uid)) {
    query.uid = query.uid.map(uid => uid === '' ? -1 : uid)
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
