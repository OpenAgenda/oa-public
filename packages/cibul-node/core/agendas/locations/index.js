'use strict';

const _ = require('lodash');

module.exports = (core, agendaOrUid) => {
  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  return {
    create: data => core.services.agendaLocations(agendaUid).create(data, {
      geocodeIfUndefined: true
    }),
    update: (uid, data) => core.services.agendaLocations(agendaUid).update(uid, data, {
      geocodeIfUndefined: true
    }),
    patch: (uid, data) => core.services.agendaLocations(agendaUid).patch(uid, data, {
      geocodeIfUndefined: true
    }),
    remove: uid => core.services.agendaLocations(agendaUid).remove(uid),
    get: uid => core.services.agendaLocations(agendaUid).get(uid),
    list: (query, nav) => core.services.agendaLocations(agendaUid).list(query, nav, {
      total: true
    })
  }
}
