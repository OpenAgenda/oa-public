import { produce } from 'immer';
import { BadRequest } from '@openagenda/verror';
import convertTimingsRange from './convertTimingsRange.js';

export default produce((query = {}, options = {}) => {
  const { removed } = { removed: false, ...options };

  if (Array.isArray(query.valid) && query.valid.length > 0) {
    query.valid = query.valid.map((v) => {
      if (v === 'true' || v === true) return true;
      if (v === 'false' || v === false) return false;
      if (v === 'null' || v === null || v === undefined) return null;
      return v;
    });
  }

  if (
    query.countryCode
    && query.countryCode.length
    && query.countryCode.includes('null')
  ) {
    query.countryCode = query.countryCode.filter((c) => c !== 'null');
  }

  try {
    ['state', 'status'].forEach((f) => {
      if (!query[f]) {
        return;
      }

      query[f] = []
        .concat(query[f])
        .map((s) => (typeof s === 'string' ? parseInt(s, 10) : s));
    });
  } catch (e) {
    // console.log('error', 'provided state is invalid %j', query);
  }

  if (query.if) {
    query.includeFields = query.if;
    delete query.if;
  }

  if (Array.isArray(query.uid)) {
    query.uid = query.uid.map((uid) => (uid === '' ? -1 : uid));
  } else if (Object.prototype.toString.call(query.uid) === '[object Object]') {
    try {
      query.uid = Object.values(query.uid).map((uid) => parseInt(uid, 10));
    } catch (e) {
      throw new Error('uids provided are invalid');
    }
  }

  try {
    if (query.attendanceMode) {
      query.attendanceMode = []
        .concat(query.attendanceMode)
        .map((s) => (typeof s === 'string' ? parseInt(s, 10) : s));
    }
  } catch (e) {
    // log('error', 'provided attendanceMode is invalid %j', query);
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
      query.geo?.northEast.lat === query.geo?.southWest.lat
      || query.geo?.northEast.lng === query.geo?.southWest.lng
    ) {
      throw new BadRequest(
        'northEast and southWest cannot have same lat or lng values',
      );
    }
  }

  if (
    !query.originAgenda?.uid
    && [].concat(query.originAgendaUid).filter((v) => v !== undefined).length
  ) {
    query.originAgenda = {
      ...query.originAgenda,
      uid: query.originAgendaUid,
    };
  }

  if (
    removed !== false
    && query.sort
    && [].concat(query.sort)[0].split('.').shift() !== 'updatedAt'
    && [].concat(query.sort).length === 1
  ) {
    throw new BadRequest(
      'updatedAt is the only allowed sort when removed events are included',
    );
  }
});
