'use strict';

const { produce } = require('immer');
const log = require('@openagenda/logs')('preCleanRawQuery');
const {
  BadRequest,
} = require('@openagenda/verror');

const convertTimingsRange = require('./convertTimingsRange');

module.exports = produce((query = {}) => {
  try {
    ['state', 'status'].forEach(f => {
      if (!query[f]) {
        return;
      }

      query[f] = []
        .concat(query[f])
        .map(s => (typeof s === 'string' ? parseInt(s, 10) : s));
    });
  } catch (e) {
    log('error', 'provided state is invalid %j', query);
  }

  if (Array.isArray(query.uid)) {
    query.uid = query.uid.map(uid => (uid === '' ? -1 : uid));
  } else if (query.uid instanceof Object) {
    try {
      query.uid = Object.values(query.uid).map(uid => parseInt(uid, 10));
    } catch (e) {
      throw new Error('uids provided are invalid');
    }
  }

  try {
    if (query.attendanceMode) {
      query.attendanceMode = []
        .concat(query.attendanceMode)
        .map(s => (typeof s === 'string' ? parseInt(s, 10) : s));
    }
  } catch (e) {
    log('error', 'provided attendanceMode is invalid %j', query);
  }

  if (query.date && (query.date.gte || query.date.lte)) {
    query.timings = query.date;
    delete query.date;
  }

  if (query.timings?.range) {
    query.timings = convertTimingsRange(query.timings);
  }

  if (query.geo?.northEast && query.geo?.southWest) {
    if (
      (query.geo?.northEast.lat === query.geo?.southWest.lat)
      || (query.geo?.northEast.lng === query.geo?.southWest.lng)
    ) {
      throw new BadRequest('northEast and southWest cannot have same lat or lng values');
    }
  }
});
