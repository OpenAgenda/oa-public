'use strict';

const log = require('@openagenda/logs')('Aggregators/loadSourceRemoves');

module.exports = async ({
  listEventReferences,
  enqueueRemove
}, {
  aggregatorAgendaUid,
  sourceAgendaUid
}) => {
  let lastId = 0, hasMore = true;

  while (hasMore) {
    const {
      lastId: updatedLastId,
      events
    } = await listEventReferences(sourceAgendaUid, lastId);

    log('source %s, aggregator %s: enqueuing %s removes', sourceAgendaUid, aggregatorAgendaUid, events.length);

    for (const { uid: eventUid } of events) {
      await enqueueRemove({
        aggregatorAgendaUid,
        sourceAgendaUid,
        eventUid,
        batched: true
      });
    }

    lastId = updatedLastId;
    if (!events.length) hasMore = false;
  }
}
