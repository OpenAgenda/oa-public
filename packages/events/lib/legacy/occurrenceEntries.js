const findMatching = (occurrences, occurrence) =>
  occurrences
    .filter(
      (o) =>
        o.date === occurrence.date
        && o.time_start === occurrence.time_start
        && o.time_end === occurrence.time_end,
    )
    .pop();

const occurrenceEntries = async (client, eventId, data) => {
  const currentOccurrences = await client('occurrence')
    .select(['id', 'date', 'time_start', 'time_end'])
    .where('event_id', eventId);

  const setOccurrenceIds = await Promise.all(
    data.occurrence.map(async (occurrenceToSet) => {
      const matching = findMatching(currentOccurrences, occurrenceToSet);

      if (matching) {
        return client('occurrence')
          .update({
            ...occurrenceToSet,
            updated_at: new Date(),
          })
          .where('id', matching.id)
          .then((r) => r.pop());
      }

      return client('occurrence')
        .insert({
          ...occurrenceToSet,
          created_at: new Date(),
          updated_at: new Date(),
          event_id: eventId,
        })
        .then((r) => r.pop());
    }),
  );

  const toDeleteIds = currentOccurrences
    .filter(({ id }) => !setOccurrenceIds.some((setId) => setId === id))
    .map((o) => o.id);

  if (toDeleteIds.length) {
    await client('occurrence').delete().whereIn('id', toDeleteIds);
  }
};

export default occurrenceEntries;
