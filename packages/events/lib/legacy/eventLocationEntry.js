'use strict';

const log = require('@openagenda/logs')('legacy/eventLocationEntry');
const setTranslationEntries = require('./setTranslationEntries');

module.exports = async (client, eventId, data) => {
  const id = await client('event_location')
    .first('id')
    .where('event_id', eventId)
    .then(r => (r ? r.id : null));

  const q = client('event_location');

  if (!id) {
    log('inserting event_location for event legacy %s', eventId);
    q.insert({
      ...data.event_location,
      event_id: eventId,
      created_at: new Date()
    });
  } else {
    log('updating event_location %s', id);
    q.update(data.event_location).where('id', id);
  }

  const result = await q;
  const eventLocationId = id || result.pop();
  
  await setTranslationEntries(client, 'event_location_translation', eventLocationId, data);

  return {
    id: eventLocationId
  };
};
