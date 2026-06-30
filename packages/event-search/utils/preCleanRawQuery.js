import { produce } from 'immer';
import { BadRequest } from '@openagenda/verror';
import convertTimingsRange from './convertTimingsRange.js';
import adminLevelSwap from './adminLevelSwap.js';

export default produce((query = {}, options = {}) => {
  const { removed } = { removed: false, ...options };

  // Canonical `adminLevelN` filter keys are aliases of the legacy location names
  // (adminLevel1=region, adminLevel2=department, adminLevel4=city,
  // adminLevel6=district). Only the legacy names are whitelisted by validateQuery
  // and indexed in Elasticsearch, so swap the canonical input onto its legacy key
  // before validation. adminLevel3/adminLevel5 have no alias (al === to) and are
  // already valid, so they are left untouched.
  adminLevelSwap.map
    .filter(({ al, to }) => al !== to)
    .forEach(({ al, to }) => {
      if (query[al] === undefined) {
        return;
      }
      // Merge rather than overwrite so a request mixing the legacy and canonical
      // keys (e.g. ?city[]=Paris&adminLevel4[]=Lyon) keeps both values.
      query[to] = [].concat(query[to] ?? [], query[al]);
      delete query[al];
    });

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
