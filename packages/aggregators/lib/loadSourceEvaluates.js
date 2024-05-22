'use strict';

const _ = require('lodash');
const logs = require('@openagenda/logs');

const log = logs('loadSourceEvaluates');

module.exports = async (
  { listEventReferences, enqueueEvaluate },
  {
    aggregatorAgendaUid,
    aggregatorRules,
    aggregatorLimit,
    sourceAgenda,
    sourceRules,
    formSchema,
    query,
  },
) => {
  const logBundle = {
    sourceAgenda: _.pick(sourceAgenda, ['slug', 'uid']),
    aggregatorAgenda: { uid: aggregatorAgendaUid },
  };
  log.info('loading', logBundle);

  let count = 0;
  let after;
  while (after !== null) {
    const {
      events,
      after: nextAfter,
      total,
    } = await listEventReferences(sourceAgenda.uid, after, query);
    after = nextAfter;
    count += events.length;
    log('enqueuing evaluates', { ...logBundle, count, total });

    for (const event of events) {
      await enqueueEvaluate({
        agenda: _.pick(sourceAgenda, ['slug', 'title', 'id', 'uid']),
        event,
        batched: true,
        formSchema,
        aggregatorsBuffer: [
          {
            aggregatorAgendaUid,
            aggregatorRules,
            aggregatorLimit,
            sourceRules,
          },
        ],
      });
    }
  }

  log('done', { ...logBundle, count });
};
