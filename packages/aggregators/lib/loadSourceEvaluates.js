'use strict';

const _ = require('lodash');
const Log = require('../utils/Log')('Aggregators/loadSourceEvaluates');

module.exports = async (
  { listEventReferences, loadEvent, enqueueEvaluate },
  {
    aggregatorAgendaUid,
    aggregatorRules,
    sourceAgenda,
    sourceRules,
    formSchema
  }
) => {
  const log = Log(
    `source agenda ${sourceAgenda.slug} of aggregator agenda ${aggregatorAgendaUid}`
  );
  let lastId = 0;
  let hasMore = true;

  let count = 0;

  while (hasMore) {
    const { lastId: updatedLastId, events } = await listEventReferences(
      sourceAgenda.uid,
      lastId
    );

    log('enqueuing %s evaluates', events.length);
    count += events.length;

    for (const { uid: eventUid } of events) {
      await enqueueEvaluate({
        agenda: _.pick(sourceAgenda, ['slug', 'id', 'uid']),
        event: await loadEvent(sourceAgenda.uid, eventUid),
        aggregatorAgendaUid,
        aggregatorRules,
        batched: true,
        formSchema,
        sourceRules
      });
    }

    lastId = updatedLastId;
    hasMore = !!events.length;
  }

  log('enqueued %s evaluates, done', count);
};
