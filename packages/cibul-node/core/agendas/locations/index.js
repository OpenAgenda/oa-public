'use strict';

const _ = require('lodash');

module.exports = (core, agendaOrUid) => {
  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  const locations = core.services.agendaLocations(agendaUid);

  return {
    create: data => locations.create(data, {
      geocodeIfUndefined: true,
      includeImagePath: true,
      agendaUid
    }),
    update: (uid, data) => locations.update(uid, data, {
      geocodeIfUndefined: true,
      includeImagePath: true,
      agendaUid
    }),
    patch: (uid, data) => locations.patch(uid, data, {
      geocodeIfUndefined: true,
      includeImagePath: true,
      agendaUid
    }),
    remove: uid => locations.remove(uid, { agendaUid }),
    get: (identifiers, options = {}) => locations.get(identifiers, {
      ...options,
      includeImagePath: true
    }),
    list: (query, nav) => locations.list(query, {
      ...nav,
      useAfter: true
    }, {
      total: true,
      includeImagePath: true,
      detailed: !!query?.detailed
    }),
    merge: (mergeIn, query, data) => locations.merge(mergeIn, query, data)
  }
}
