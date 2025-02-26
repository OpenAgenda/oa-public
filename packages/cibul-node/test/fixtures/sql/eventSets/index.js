import fs from 'node:fs';
import ih from 'immutability-helper';

export default function insertEventSet(knex, raw, eventSetId, extendWith = {}) {
  const { event, agendaEvents } = JSON.parse(
    fs.readFileSync(`${import.meta.dirname}/${eventSetId}.json`, 'utf-8'),
  );

  raw.push(
    knex('event_2').insert([
      extendWith.event ? ih(event, extendWith.event) : event,
    ]),
  );

  raw.push(
    knex('agenda_event').insert(
      extendWith.agendaEvents
        ? ih(agendaEvents, extendWith.agendaEvents)
        : agendaEvents,
    ),
  );
}
