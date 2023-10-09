'use strict';

const Log = require('../utils/Log')('Aggregators/loadSourceRemoves');

module.exports = async (
  { listEventReferences, enqueueRemove },
  { aggregatorAgendaUid, sourceAgendaUid },
) => {
  const log = Log(
    `source agenda ${sourceAgendaUid} of aggregator agenda ${aggregatorAgendaUid}`,
  );
  let after;
  let hasMore = true;
  let count = 0;

  while (hasMore) {
    const { after: nextAfter, events } = await listEventReferences(
      sourceAgendaUid,
      after,
    );

    log('enqueuing %s removes', events.length);
    count += events.length;

    for (const event of events) {
      await enqueueRemove({
        aggregatorsBuffer: [
          {
            aggregatorAgendaUid,
          },
        ],
        event,
        sourceAgendaUid,
        batched: true,
      });
    }

    after = nextAfter;
    if (!events.length) hasMore = false;
  }
  log('enqueued %s removes, done', count);
};
