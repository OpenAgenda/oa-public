'use strict';

const findMatching = (occurrences, occurrence) => occurrences.filter(o => {
  return (o.date === occurrence.date)
    && (o.time_start === occurrence.time_start)
    && (o.time_end === occurrence.time_end);
}).pop();

module.exports = async (client, eventId, data) => {
  const currentOccurrences = await client('occurrence')
    .select(['id', 'date', 'time_start', 'time_end'])
    .where('event_id', eventId);

  const setOccurrenceIds = [];

  for (const occurrenceToSet of data.occurrence) {
    const matching = findMatching(currentOccurrences, occurrenceToSet);

    setOccurrenceIds.push(await (matching
      ? client('occurrence').update({
        ...occurrenceToSet,
        updated_at: new Date()
      }).where('id', matching.id)
      : client('occurrence').insert({
        ...occurrenceToSet,
        created_at: new Date(),
        updated_at: new Date(),
        event_id: eventId
      })
    ).then(r => r.pop()));
  }

  const toDeleteIds = currentOccurrences.filter(({ id }) => !setOccurrenceIds
    .filter(setId => setId === id)
    .length
  ).map(o => o.id);

  if (toDeleteIds.length) {
    await client('occurrence').delete().whereIn('id', toDeleteIds);
  }
}