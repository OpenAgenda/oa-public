'use strict';

const ih = require('immutability-helper');
const { merge } = require('@openagenda/form-schemas').utils;

function mergeEvent(event, agendaEvent, networkCustom, custom) {
  return ih(event, [networkCustom, custom].reduce((update, data) => {
    if (!data) return update;
    Object.keys(data).forEach(field => {
      update[field] = { $set: data[field] };
    });
    return update;
  }, agendaEvent ? ['state', 'featured', 'sourceAgendaUid'].reduce((aeSets, aeField) => ({
    ...aeSets,
    [aeField]: { $set: agendaEvent[aeField] }
  }), {}) : {}));
}

module.exports.event = mergeEvent;

module.exports.schemas = merge;

module.exports.eventFromObject = ({
  event,
  agendaEvent,
  custom
}) => mergeEvent(event, agendaEvent, custom.network, custom.agenda);
