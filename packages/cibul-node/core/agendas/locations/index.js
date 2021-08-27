'use strict';

const _ = require('lodash');
const list = require('./list');
const get = require('./get');

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
    remove: (uid, options = {}) => locations.remove(uid, {
      agendaUid,
      removeEvents: !!options.removeEvents,
    }),
    get: get(core, agendaOrUid),
    list: list(core, agendaOrUid),
    merge: (mergeIn, query, data) => locations.merge(mergeIn, query, data)
  };
};
