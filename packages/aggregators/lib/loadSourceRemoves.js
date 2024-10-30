'use strict';

const logs = require('@openagenda/logs');

const log = logs('loadSourceRemoves');

module.exports = async (
  { listEventReferences, enqueueRemove },
  { aggregatorAgendaUid, sourceAgendaUid },
) => {
  const logBundle = {
    sourceAgenda: { uid: sourceAgendaUid },
    aggregatorAgenda: { uid: aggregatorAgendaUid },
  };
  log.info('processing', logBundle);

  let after;
  let count = 0;

  while (after !== null) {
    const { after: nextAfter, events } = await listEventReferences(
      sourceAgendaUid,
      after,
    );

    log('enqueuing removes', { ...logBundle, count: events.length });
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
  }
  log('enqueuing done', { ...logBundle, count });
};
