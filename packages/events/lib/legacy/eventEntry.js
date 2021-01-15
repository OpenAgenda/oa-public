'use strict';

const log = require('@openagenda/logs')('legacy/eventEntry');

const setTranslationEntries = require('./setTranslationEntries');

module.exports = async (client, data) => {
  const id = await client.first('id')
    .from('event')
    .where('uid', data.event.uid)
    .then(r => (r ? r.id : null));

  log(id ? 'legacy id found: %s' : 'no legacy id found', id);

  const q = client('event');

  if (!id) {
    q.insert({
      ...data.event,
      created_at: new Date()
    });
  } else {
    q.update(data.event).where('id', id);
  }

  const result = await q;
  const eventId = id || result.pop();

  await log('%s done for legacy event of id %s', id ? 'update' : 'create', eventId);

  await setTranslationEntries(client, 'event_translation', eventId, data);

  return {
    id: eventId,
    operation: id ? 'update' : 'create'
  };
};
