'use strict';

const fs = require('fs');

module.exports = (knex, raw, eventSetId) => {
  const {
    legacyEvent,
    eventLocation,
    occurrences,
    event,
    agendaEvents
  } = JSON.parse(fs.readFileSync(`${__dirname}/${eventSetId}.json`, 'utf-8'));

  raw.push(knex('event').insert([legacyEvent]));
  raw.push(knex('event_location').insert([eventLocation]));
  raw.push(knex('occurrence').insert(occurrences));
  raw.push(knex('event_2').insert([event]));
  raw.push(knex('agenda_event').insert(agendaEvents));
}
