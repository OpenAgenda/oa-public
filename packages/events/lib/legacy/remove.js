'use strict';

module.exports = async (client, event) => {
  const legacyEventId = await client('event').first('id').where('uid', event.uid).then(r => r?.id);
  await client('event').delete().where('uid', event.uid);

  if (!legacyEventId) {
    return {
      operation: null
    }
  };

  await client('event_location').delete().where('event_id', legacyEventId);
  await client('occurrence').delete().where('event_id', legacyEventId);
  await client('event_translation').delete().where('id', legacyEventId);

  await client('deleted').insert({
    uid: event.uid,
    type: 'event',
    deleted_at: new Date(),
    store: JSON.stringify(event),
    deleted_id: legacyEventId
  });
  
  return {
    operation: 'remove'
  };
}