import fs from 'node:fs';
import ih from 'immutability-helper';

export default async function insertEventSet(
  knex,
  eventSetId,
  extendWith = {},
) {
  const { event, agendaEvents } = JSON.parse(
    fs.readFileSync(`${import.meta.dirname}/${eventSetId}.json`, 'utf-8'),
  );

  await knex('event_2').insert([
    extendWith.event ? ih(event, extendWith.event) : event,
  ]);

  await knex('agenda_event').insert(
    extendWith.agendaEvents
      ? ih(agendaEvents, extendWith.agendaEvents)
      : agendaEvents,
  );
}
