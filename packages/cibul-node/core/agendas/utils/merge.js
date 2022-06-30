'use strict';

const { merge } = require('@openagenda/form-schemas').utils;
const eventFormSchema = require('@openagenda/event-form/src/schema');
const getAddMethod = require('./getAddMethod');

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
  if (event && load.event && agendaEvent) {
    compiled.addMethod = getAddMethod(event, agendaEvent);
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
    ['state', 'featured', 'sourcePaths', 'aggregated', 'canEdit'].forEach(aeField => {
      compiled[aeField] = agendaEvent[aeField];
    });

    if (agendaEvent.updatedAt > compiled.updatedAt) {
      compiled.updatedAt = agendaEvent.updatedAt;
    }
  }

  if (agendaEvent && agendaEvent.sourceAgendas) {
    compiled.sourceAgendas = agendaEvent.sourceAgendas;
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

module.exports.schemasWithEvent = function schemasWithEvent(...args) {
  const schemas = args.concat([]);
  const {
    access,
    includeNonDataFields
  } = schemas.pop();
  return eventFormSchema({
    // languages: true,
    schemaExtensions: schemas,
    access: access?.read === 'internal' ? null : access,
    excludeNonDataFields: !includeNonDataFields
  });
};

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
