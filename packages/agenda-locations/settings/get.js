'use strict';

const flattenLocationTagSet = require('@openagenda/event-form/build/utils/flattenLocationTagSet');

async function get(service, { setUid, agendaUid }, options = {}) {
  const {
    lang
  } = {
    lang: null,
    ...options
  };

  const agendaSettings = agendaUid ? await service.interfaces.getAgendaLocationSettings(agendaUid) : null;

  //console.log(agendaSettings.tagSet.groups.find(e => e.name === 'Types de lieu').tags.filter(e => e.id === 21 || e.id === 22));
  if (lang && agendaSettings?.tagSet) {
    agendaSettings.tagSet = flattenLocationTagSet(agendaSettings.tagSet, lang);
  }
  return {
    eventForm: {
      detailed: false
    },
    labels: {},
    tagSet: {
      groups: []
    },
    access: {
      create: true,
      delete: true,
      merge: true,
      update: true
    },
    ...(agendaSettings || {})
  };
}

module.exports.byAgendaUid = (service, uid, options) => get(service, { agendaUid: uid }, options);

module.exports.bySetUid = (service, uid, options) => get(service, { setUid: uid }, options);
