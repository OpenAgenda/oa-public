'use strict';

const fs = require('fs');
const ih = require('immutability-helper');

module.exports = function insertEventSet(knex, raw, eventSetId, extendWith = {}) {
  const {
    legacyEvent,
    eventLocation,
    occurrences,
    event,
    agendaEvents
  } = JSON.parse(fs.readFileSync(`${__dirname}/${eventSetId}.json`, 'utf-8'));

  if (legacyEvent) {
    raw.push(knex('event').insert([
      extendWith.legacyEvent ? ih(legacyEvent, extendWith.legacyEvent) : legacyEvent
    ]));
  }
  if (eventLocation) {
    raw.push(knex('event_location').insert([
      extendWith.eventLocation ? ih(eventLocation, extendWith.eventLocation) : eventLocation
    ]));
  }
  if (occurrences) {
    raw.push(knex('occurrence').insert(
      extendWith.occurrences ? ih(occurrences, extendWith.occurrences) : occurrences
    ));
  }
  raw.push(knex('event_2').insert([
    extendWith.event ? ih(event, extendWith.event) : event
  ]));

  raw.push(knex('agenda_event').insert(
    extendWith.agendaEvents ? ih(agendaEvents, extendWith.agendaEvents) : agendaEvents
  ));
};
