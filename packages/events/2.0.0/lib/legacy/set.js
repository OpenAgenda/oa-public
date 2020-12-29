'use strict';

const eventEntry = require('./eventEntry');
const eventLocationEntry = require('./eventLocationEntry');
const occurrenceEntries = require('./occurrenceEntries');
const baseTransform = require('./baseTransform');

module.exports = async (client, event) => {
  const locationId = event.locationUid ? await client.first('id')
    .from('location')
    .where('uid', event.locationUid)
    .then(r => r ? r.id : null) : null;

  const userId = event.ownerUid ? await client.first('id')
    .from('user')
    .where('uid', event.ownerUid)
    .then(r => r ? r.id : null) : null;

  const data = baseTransform(event, { locationId, userId });

  const {
    id: eventId,
    operation
  } = await eventEntry(client, data);

  const {
    id: eventLocationId
  } = await eventLocationEntry(client, eventId, data);

  await occurrenceEntries(client, eventId, data);

  return {
    eventId,
    operation
  }
}

module.exports.baseTransform = baseTransform;
