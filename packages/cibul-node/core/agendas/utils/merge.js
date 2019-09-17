'use strict';

const ih = require('immutability-helper');
const { merge } = require('@openagenda/form-schemas').utils;

module.exports.event = (event, agendaEvent, networkCustom, custom) => {
  return ih(event, [networkCustom, custom].reduce((update, data) => {
    if (!data) return update;
    Object.keys(data).forEach(field => {
      update[field] = { $set: data[field] };
    });
    return update;
  }, ['state', 'featured', 'sourceAgendaUid'].reduce((aeSets, aeField) => ({
    ...aeSets,
    [aeField]: { $set: agendaEvent[aeField] }
  }), {})));
}

module.exports.schemas = merge
