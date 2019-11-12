'use strict';

const ih = require('immutability-helper');
const { merge } = require('@openagenda/form-schemas').utils;
const eventFormSchema = require( '@openagenda/event-form/src/schema' );

function mergeEvent(event, agendaEvent, networkCustom, custom) {
  return ih(event, [networkCustom, custom].reduce((update, data) => {
    if (!data) return update;
    Object.keys(data).forEach(field => {
      update[field] = { $set: data[field] };
    });
    return update;
  }, agendaEvent ? ['state', 'featured', 'sourceAgendaUid', 'aggregated'].reduce((aeSets, aeField) => ({
    ...aeSets,
    [aeField]: { $set: agendaEvent[aeField] }
  }), {}) : {}));
}

module.exports.event = mergeEvent;

module.exports.schemas = merge;

module.exports.schemasWithEvent = (...args) => eventFormSchema({
  languages: true,
  schemaExtensions: args,
  excludeNonDataFields: true,
  includeInternalFields: true
});

module.exports.eventFromObject = ({
  event,
  agendaEvent,
  custom
}) => mergeEvent(
  event,
  agendaEvent,
  custom ? custom.network : null,
  custom ? custom.agenda : null
);
