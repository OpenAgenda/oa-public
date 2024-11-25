import logs from '@openagenda/logs';

const log = logs('loadSourceRemoves');

export default async (
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

  do {
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
  } while (after);

  log('enqueuing done', { ...logBundle, count });
};
