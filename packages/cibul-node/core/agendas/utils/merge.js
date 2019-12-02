'use strict';

const ih = require('immutability-helper');
const { merge } = require('@openagenda/form-schemas').utils;
const eventFormSchema = require( '@openagenda/event-form/src/schema' );

function mergeEvent(event, agendaEvent, networkCustom, agendaCustom, options = {}) {
  const {
    originAgenda,
    includeFields
  } = {
    includeFields: null,
    originAgenda: null,
    ...options
  };
  const compiled = ih(event || {}, [networkCustom, agendaCustom].reduce((update, data) => {
    if (!data) return update;
    Object.keys(data).forEach(field => {
      if (!includeFields || includeFields.includes(field)) {
        update[field] = { $set: data[field] };
      }
    });
    return update;
  }, {}));

  if (agendaEvent) {
    ['state', 'featured', 'sourceAgendaUid', 'aggregated'].forEach(aeField => {
      compiled[aeField] = agendaEvent[aeField];
    });
  }

  if (originAgenda) {
    compiled.agenda = originAgenda;
  }

  return compiled;
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
}, options = {}) => mergeEvent(
  event,
  agendaEvent,
  custom ? custom.network : null,
  custom ? custom.agenda : null,
  options
);
