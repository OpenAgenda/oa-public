'use strict';

const _ = require('lodash');
const list = require('./list');
const get = require('./get');
const patch = require('./patch');
const remove = require('./remove');

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
    patch: patch(core, agendaOrUid),
    remove: remove(core, agendaOrUid),
    get: get(core, agendaOrUid),
    list: list(core, agendaOrUid),
    merge: (mergeIn, query, data) => locations.merge(mergeIn, query, data)
  };
};
