'use strict';

const _ = require('lodash');

module.exports = (core, agendaOrUid) => {
  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  const locations = core.services.agendaLocations(agendaUid);

  return {
    create: data => locations.create(data, {
      geocodeIfUndefined: true,
      includeImagePath: true
    }),
    update: (uid, data) => locations.update(uid, data, {
      geocodeIfUndefined: true,
      includeImagePath: true
    }),
    patch: (uid, data) => locations.patch(uid, data, {
      geocodeIfUndefined: true,
      includeImagePath: true
    }),
    remove: uid => locations.remove(uid),
    get: uid => locations.get(uid, {
      includeImagePath: true
    }),
    list: (query, nav) => locations.list(query, nav, {
      total: true,
      includeImagePath: true
    }),
    merge: (mergeIn, query, data) => locations.merge(mergeIn, query, data)
  }
}
