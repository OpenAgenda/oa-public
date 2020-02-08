'use strict';

const Log = require('../utils/Log')('Aggregators/loadSourceRemoves');

module.exports = async ({
  listEventReferences,
  enqueueRemove
}, {
  aggregatorAgendaUid,
  sourceAgendaUid
}) => {
  const log = Log(`source agenda ${sourceAgendaUid} of aggregator agenda ${aggregatorAgendaUid}`);
  let lastId = 0, hasMore = true;
  let count = 0;

  while (hasMore) {
    const {
      lastId: updatedLastId,
      events
    } = await listEventReferences(sourceAgendaUid, lastId);

    log('enqueuing %s removes', events.length);
    count+=events.length;

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
  log('enqueued %s removes, done', count);
}
