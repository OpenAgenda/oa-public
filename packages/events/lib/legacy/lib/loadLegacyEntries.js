'use strict';

module.exports = async (knex, legacyIdentifiers) => {
  const entries = {};
  
  entries.event = await knex('event').first('*').where(legacyIdentifiers);
  
  const legacyEventId = entries.event?.id;
  
  if (!legacyEventId) {
    throw new Error('legacy event not found');
  }
  
  entries.eventTranslations = await knex('event_translation')
    .select('*')
    .where('id', legacyEventId);
  entries.eventLocation = await knex('event_location')
    .first('*')
    .where('event_id', legacyEventId);
  entries.occurrences = await knex('occurrence')
    .select('*')
    .where('event_id', legacyEventId);
  entries.eventLocationTranslations = await knex('event_location_translation')
    .select('*')
    .where('id', entries.eventLocation?.id);
  entries.agendaEventReferences = await knex('agenda_event_reference')
    .select('*')
    .where('event_id', legacyEventId);
  entries.location = await knex('location')
    .first(['uid', 'timezone'])
    .where('id', entries.eventLocation?.location_id);

  return entries;
}
