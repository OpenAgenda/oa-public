'use strict';

const ih = require('immutability-helper');
const { merge } = require('@openagenda/form-schemas').utils;
const eventFormSchema = require( '@openagenda/event-form/src/schema' );

function mergeEvent(event, agendaEvent, networkCustom, agendaCustom, options = {}) {
  const {
    originAgenda,
    includeFields,
    customOnly
  } = {
    includeFields: null,
    originAgenda: null,
    customOnly: false,
    ...options
  };


  const compiled = {};

  if (event && !customOnly) {
    Object.keys(event).forEach(eventField => {
      if (includeFields && !includeFields.includes(eventField)) {
        return;
      }
      compiled[eventField] = event[eventField];
    });
  }

  [networkCustom, agendaCustom].filter(d => !!d).forEach(data => {
    Object.keys(data).forEach(field => {
      if (includeFields && !includeFields.includes(field)) {
        return;
      }
      compiled[field] = data[field];
    });
  });

  if (agendaEvent && !customOnly) {
    ['state', 'featured', 'sourceAgendaUid', 'aggregated'].forEach(aeField => {
      compiled[aeField] = agendaEvent[aeField];
    });
  }

  if (originAgenda && !customOnly) {
    compiled.agenda = originAgenda;
  }

  return compiled;
}

module.exports.event = mergeEvent;

module.exports.schemas = merge;

module.exports.schemasWithEvent = (...args) => eventFormSchema({
  languages: true,
  schemaExtensions: args,
  excludeNonDataFields: true
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
