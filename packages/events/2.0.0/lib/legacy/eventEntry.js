'use strict';

const setTranslationEntries = require('./setTranslationEntries');

module.exports = async (client, data) => {
  const id = await client.first('id')
    .from('event')
    .where('uid', data.event.uid)
    .then(r => r ? r.id : null);
  
  const q = client('event');

  if (!id) {
    q.insert({
      ...data.event,
      created_at: new Date()
    });
  } else {
    q.update(data.event).where('id', id);
  }

  const eventId = await q.then(impacted => [].concat(impacted).pop());

  await setTranslationEntries(client, 'event_translation', eventId, data);

  return {
    id: eventId,
    operation: id ? 'update' : 'create'
  }
}
