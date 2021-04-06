'use strict';

const fromDbEntryToSettings = require('./lib/fromDbEntryToSettings');

async function get(service, { setUid, agendaUid }, options = {}) {
  const requestedAgendaUid = agendaUid || options.agendaUid;

  const {
    knex
  } = service.clients;

  const defaultAccess = {
    authorized: true,
    external: false,
    serviceLabel: null,
    link: null
  };

  const settings = {
    eventForm: {
      detailed: false
    },
    labels: {},
    tagSet: {
      groups: []
    },
    access: {
      create: defaultAccess,
      delete: defaultAccess,
      merge: defaultAccess,
      update: defaultAccess
    }
  };

  const agendaSettings = requestedAgendaUid && service.interfaces?.getAgendaLocationSettings ? await service.interfaces.getAgendaLocationSettings(requestedAgendaUid) : null;

  if (agendaSettings) {
    Object.assign(settings, agendaSettings);
  }

  const effectiveSetUid = setUid || (await service.interfaces.getAgendaDetailsByUid(requestedAgendaUid).then(d => d?.locationSetUid));
  if (effectiveSetUid) {
    const locationSetSettings = await knex
      .first('settings')
      .from('location_set')
      .where('uid', effectiveSetUid)
      .then(entry => (entry?.settings ? JSON.parse(entry.settings) : null));
    if (locationSetSettings) {
      Object.assign(settings, locationSetSettings);
    }
  }
  return fromDbEntryToSettings(settings, { ...options, setUid: effectiveSetUid });
}

module.exports.byAgendaUid = (service, uid, options) => get(service, { agendaUid: uid }, options);

module.exports.bySetUid = (service, uid, options) => get(service, { setUid: uid }, options);
