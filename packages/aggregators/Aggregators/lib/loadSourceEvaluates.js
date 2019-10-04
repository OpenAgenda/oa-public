'use strict';

const _ = require('lodash');

module.exports = async ({
  listEventReferences,
  loadEvent,
  enqueueEvaluate
}, {
  aggregatorAgendaUid,
  aggregatorRules,
  sourceAgenda,
  sourceRules,
  formSchema
}) => {
  let lastId = 0, hasMore = true;

  while (hasMore) {
    const {
      lastId: updatedLastId,
      events
    } = await listEventReferences(sourceAgenda.uid, lastId);

    for (const { uid: eventUid } of events) {
      await enqueueEvaluate({
        agenda: _.pick(sourceAgenda, ['slug','id','uid']),
        event: await loadEvent(sourceAgenda.uid, eventUid),
        aggregatorAgendaUid: aggregatorAgendaUid,
        batched: true,
        formSchema,
        sourceRules,
        aggregatorRules
      });
    }

    lastId = updatedLastId;
    hasMore = !!events.length;
  }
}
