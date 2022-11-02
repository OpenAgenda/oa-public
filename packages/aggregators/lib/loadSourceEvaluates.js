'use strict';

const _ = require('lodash');
const Log = require('../utils/Log')('Aggregators/loadSourceEvaluates');

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
  const log = Log(
    `source agenda ${sourceAgenda.slug} of aggregator agenda ${aggregatorAgendaUid}`,
  );

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
    log('enqueuing %s evaluates on %s', count, total);

    for (const event of events) {
      await enqueueEvaluate({
        agenda: _.pick(sourceAgenda, ['slug', 'title', 'id', 'uid']),
        event,
        aggregatorAgendaUid,
        aggregatorRules,
        aggregatorLimit,
        batched: true,
        formSchema,
        sourceRules,
      });
    }
  }

  log('enqueued %s evaluates, done', count);
};
