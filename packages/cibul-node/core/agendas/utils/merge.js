'use strict';

const ih = require('immutability-helper');
const { merge } = require('@openagenda/form-schemas').utils;
const eventFormSchema = require('@openagenda/event-form/src/schema');

function mergeEvent(event, agendaEvent, networkCustom, agendaCustom, options = {}) {
  const {
    originAgenda,
    includeFields,
    member,
    load
  } = {
    includeFields: null,
    originAgenda: null,
    member: null,
    load: {
      event: true,
      custom: true,
      agendaEvent: true
    },
    ...options
  };

  const compiled = {};

  if (event && load.event) {
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

  if (agendaEvent && load.agendaEvent) {
    ['state', 'featured', 'sourcePaths', 'aggregated'].forEach(aeField => {
      compiled[aeField] = agendaEvent[aeField];
    });
  }

  if (originAgenda) {
    compiled.originAgenda = originAgenda;
  }

  if (member) {
    compiled.member = member;
  }

  return compiled;
}

module.exports.event = mergeEvent;

module.exports.schemas = merge;

module.exports.schemasWithEvent = (agendaSchema, networkSchema, access) => eventFormSchema({
  languages: true,
  schemaExtensions: [agendaSchema, networkSchema],
  access,
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
