'use strict';

module.exports = async ({
  getAgendaSourceId,
  updateSourceEntry,
  getMergedSchema,
  enqueueLoadSourceEvaluates
}, aggregatorAgenda, sourceAgenda, rules = [], options = {}) => {

  const {
    evaluate
  } = {
    evaluate: false,
    ...options
  }

  const sourceId = await getAgendaSourceId(sourceAgenda, aggregatorAgenda);

  if (!sourceId) {
    throw new Error('Agenda is already source');
  }

  const {
    aggregator,
    source
  } = await updateSourceEntry(sourceId, rules);

  if (evaluate) {
    return await enqueueLoadSourceEvaluates({
      aggregatorAgendaUid: aggregatorAgenda.uid,
      aggregator,
      sourceAgenda,
      source,
      formSchema: await getMergedSchema(sourceAgenda.uid)
    });
  }
}
