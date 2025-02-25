import logs from '@openagenda/logs';
import eventEntry from './eventEntry.js';
import eventLocationEntry from './eventLocationEntry.js';
import occurrenceEntries from './occurrenceEntries.js';
import baseTransform from './baseTransform.js';

const log = logs('legacy');

const set = async (client, event) => {
  log('setting legacy for event %s', event.uid);

  const locationId = event.locationUid
    ? await client
      .first('id')
      .from('location')
      .where('uid', event.locationUid)
      .then((r) => (r ? r.id : null))
    : null;

  const userId = event.ownerUid
    ? await client
      .first('id')
      .from('user')
      .where('uid', event.ownerUid)
      .then((r) => (r ? r.id : null))
    : null;

  const data = baseTransform(event, { locationId, userId });

  const { id: eventId, operation } = await eventEntry(client, data);

  if (locationId) {
    await eventLocationEntry(client, eventId, data);
  }

  await occurrenceEntries(client, eventId, data);

  return {
    eventId,
    operation,
  };
};

export { baseTransform };
export default set;
